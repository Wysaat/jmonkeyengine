#import "Common/ShaderLib/Shadows15.glsllib"

out vec4 outFragColor;

#ifdef PSSM
in float shadowPosition;
#endif

in vec4 projCoord0;
in vec4 projCoord1;
in vec4 projCoord2;
in vec4 projCoord3;

#ifdef POINTLIGHT
    in vec4 projCoord4;
    in vec4 projCoord5;
    in vec4 worldPos;
    uniform vec3 m_LightPos; 
#else
    #ifndef PSSM        
        in float lightDot;
    #endif
#endif

#ifdef DISCARD_ALPHA
    #ifdef COLOR_MAP
        uniform sampler2D m_ColorMap;
    #else    
        uniform sampler2D m_DiffuseMap;
    #endif
    uniform float m_AlphaDiscardThreshold;
    varying vec2 texCoord;
#endif

#ifdef FADE
uniform vec2 m_FadeInfo;
#endif

void main(){

    #ifdef DISCARD_ALPHA
        #ifdef COLOR_MAP
             float alpha = texture2D(m_ColorMap,texCoord).a;
        #else    
             float alpha = texture2D(m_DiffuseMap,texCoord).a;
        #endif
      
        if(alpha < m_AlphaDiscardThreshold){
            discard;
        }
    #endif
 
    float shadow = 1.0;
    #ifdef POINTLIGHT         
            shadow = getPointLightShadows(worldPos, m_LightPos,
                           m_ShadowMap0,m_ShadowMap1,m_ShadowMap2,m_ShadowMap3,m_ShadowMap4,m_ShadowMap5,
                           projCoord0, projCoord1, projCoord2, projCoord3, projCoord4, projCoord5);
    #else
       #ifdef PSSM
            shadow = getDirectionalLightShadows(m_Splits, shadowPosition,
                           m_ShadowMap0,m_ShadowMap1,m_ShadowMap2,m_ShadowMap3,
                           projCoord0, projCoord1, projCoord2, projCoord3);
       #else
            //spotlight
            if(lightDot < 0){
                outFragColor =  vec4(1.0);
                return;
            }
            shadow = getSpotLightShadows(m_ShadowMap0,projCoord0);
       #endif
    #endif   
 
    #ifdef FADE
      shadow = max(0.0,mix(shadow,1.0,(shadowPosition - m_FadeInfo.x) * m_FadeInfo.y));    
    #endif
      
    shadow = shadow * m_ShadowIntensity + (1.0 - m_ShadowIntensity); 
    outFragColor =  vec4(shadow, shadow, shadow, 1.0);
}

