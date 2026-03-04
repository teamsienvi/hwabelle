import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface LineItem {
    name: string;
    price: number; // in dollars
    quantity: number;
    image?: string;
}

interface CheckoutRequest {
    items: LineItem[];
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
            throw new Error("STRIPE_SECRET_KEY is not configured");
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const { items, successUrl, cancelUrl, customerEmail } =
            (await req.json()) as CheckoutRequest;

        if (!items?.length) {
            return new Response(JSON.stringify({ error: "No items provided" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    ...(item.image ? { images: [item.image] } : {}),
                },
                unit_amount: Math.round(item.price * 100), // convert dollars to cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            ...(customerEmail ? { customer_email: customerEmail } : {}),
            shipping_address_collection: {
                allowed_countries: ["US", "CA"],
            },
            metadata: {
                source: "hwabelle",
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to create checkout session" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
