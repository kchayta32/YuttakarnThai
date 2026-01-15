Shader "RTS/FOWMask"
{
    Properties
    {
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _FOWTex ("Fog Texture", 2D) = "white" {}
        _Color ("Fog Color", Color) = (0,0,0,1)
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
                float3 worldPos : TEXCOORD1;
            };

            sampler2D _MainTex;
            sampler2D _FOWTex;
            float4 _MainTex_ST;
            float4 _Color;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                o.worldPos = mul(unity_ObjectToWorld, v.vertex).xyz;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // Sample Main Texture
                fixed4 col = tex2D(_MainTex, i.uv);
                
                // Calculate FOW UV based on World Position
                // Assuming World Size 500 mapped to 0-1 UV
                float2 fowUV = (i.worldPos.xz / 500.0) + 0.5;
                
                // Sample Fog Texture (Red channel = 0 is visible, 1 is hidden)
                // In our manager, Alpha 0 is visible.
                fixed4 fowSample = tex2D(_FOWTex, fowUV);
                float visibility = 1.0 - fowSample.a; 
                
                // Lerp towards Fog Color based on visibility
                // If visibility is 1 (Seen), use color. If 0 (Hidden), use _Color (Black)
                return lerp(_Color, col, visibility);
            }
            ENDCG
        }
    }
}
