import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
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
        const body = await req.json();
        const { email, session_id } = body;

        if (!email && !session_id) {
            return new Response(
                JSON.stringify({ error: "Email or session_id is required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let query = supabase
            .from("orders")
            .select("id, stripe_session_id, customer_email, items, total_amount, currency, status, shipping_address, created_at")
            .order("created_at", { ascending: false });

        if (session_id) {
            // Lookup by Stripe session — returns the single order + any others for the same email
            const { data: sessionOrder } = await supabase
                .from("orders")
                .select("customer_email")
                .eq("stripe_session_id", session_id)
                .maybeSingle();

            if (sessionOrder?.customer_email) {
                query = query.eq("customer_email", sessionOrder.customer_email);
            } else {
                // Session not found yet (webhook may still be processing)
                return new Response(JSON.stringify({ orders: [], pending: true }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        } else {
            query = query.eq("customer_email", email.toLowerCase().trim());
        }

        const { data: orders, error } = await query;

        if (error) {
            console.error("Error fetching orders:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch orders" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        return new Response(JSON.stringify({ orders: orders || [] }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to lookup orders";
        console.error("Lookup error:", message, error);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
