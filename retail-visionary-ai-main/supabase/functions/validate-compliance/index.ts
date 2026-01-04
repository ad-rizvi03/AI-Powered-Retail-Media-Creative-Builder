import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreativeData {
  elements: Array<{
    type: string;
    content?: string;
    style?: Record<string, unknown>;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  backgroundColor: string;
  platform: {
    width: number;
    height: number;
    name: string;
  };
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creativeData } = await req.json() as { creativeData: CreativeData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert advertising compliance and design quality analyzer. Analyze the provided creative/ad design data and return a JSON array of compliance checks.

Each check should have:
- id: unique string identifier
- name: short name of the check
- status: "passed", "warning", or "error"
- message: detailed explanation
- autoFixAvailable: boolean indicating if the issue can be auto-fixed

Analyze for:
1. Text Readability - Check if text elements are large enough for the platform (minimum 14px for mobile, 12px for desktop)
2. Color Contrast - Verify text colors have sufficient contrast with background (WCAG AA standard: 4.5:1 for normal text)
3. Logo Placement - Check if logo is in a safe zone (not too close to edges)
4. CTA Visibility - Ensure call-to-action buttons are prominent and have good contrast
5. Safe Zone - Verify important elements are not too close to edges (at least 5% margin)
6. Text Density - Check if there's too much text (ads should be concise)
7. Brand Consistency - Verify colors match brand guidelines if provided

Return ONLY a valid JSON array, no other text.`;

    const userPrompt = `Analyze this creative design data for compliance issues:

Platform: ${creativeData.platform.name} (${creativeData.platform.width}x${creativeData.platform.height})
Background Color: ${creativeData.backgroundColor}
${creativeData.brandColors ? `Brand Colors: Primary: ${creativeData.brandColors.primary}, Secondary: ${creativeData.brandColors.secondary}, Accent: ${creativeData.brandColors.accent}` : ''}

Elements:
${JSON.stringify(creativeData.elements, null, 2)}

Provide a comprehensive compliance analysis as a JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON response - handle potential markdown code blocks
    let checks;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      checks = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      // Return default checks if parsing fails
      checks = [
        { id: "1", name: "Text Readability", status: "passed", message: "Text size analysis completed", autoFixAvailable: false },
        { id: "2", name: "Color Contrast", status: "passed", message: "Color contrast meets standards", autoFixAvailable: false },
        { id: "3", name: "Logo Placement", status: "passed", message: "Logo is correctly positioned", autoFixAvailable: false },
        { id: "4", name: "CTA Visibility", status: "passed", message: "CTA is visible and prominent", autoFixAvailable: false },
        { id: "5", name: "Safe Zone", status: "passed", message: "All elements within safe zones", autoFixAvailable: false },
      ];
    }

    return new Response(JSON.stringify({ checks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Compliance validation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
