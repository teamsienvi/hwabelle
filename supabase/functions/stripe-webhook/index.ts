import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

        if (!stripeKey) {
            throw new Error("STRIPE_SECRET_KEY is not configured");
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const body = await req.text();
        let event: Stripe.Event;

        // Verify webhook signature if secret is available
        if (webhookSecret) {
            const signature = req.headers.get("stripe-signature");
            if (!signature) {
                return new Response(
                    JSON.stringify({ error: "Missing stripe-signature header" }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else {
            // Dev/test mode — parse event directly (log warning)
            console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
            event = JSON.parse(body) as Stripe.Event;
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            // Initialize Supabase admin client
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
            const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Check idempotency — don't insert duplicate orders
            const { data: existingOrder } = await supabase
                .from("orders")
                .select("id")
                .eq("stripe_session_id", session.id)
                .maybeSingle();

            if (existingOrder) {
                console.log(`Order already exists for session ${session.id}, skipping`);
                return new Response(JSON.stringify({ received: true }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            // Insert order record
            const { error: insertError } = await supabase.from("orders").insert({
                stripe_session_id: session.id,
                customer_email: session.customer_details?.email || session.customer_email,
                items: session.metadata || {},
                total_amount: session.amount_total || 0,
                currency: session.currency || "usd",
                status: "paid",
                shipping_address: session.shipping_details?.address || null,
            });

            if (insertError) {
                console.error("Failed to insert order:", insertError);
                // Still return 200 so Stripe doesn't retry — log for manual fix
            } else {
                console.log(`Order created for session ${session.id}`);
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Webhook processing failed" }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
