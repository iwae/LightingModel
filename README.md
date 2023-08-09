# LightingModel
Preview: http://learncocos.com/lightmodel

![image](https://github.com/iwae/LightingModel/assets/26038745/4173da1d-33f0-41c4-8a72-e27021d1aa39)


## Unlit (No Lighting)
The unlit model does not consider the effects of lighting and directly renders the object's color or texture to the screen. This model is suitable for scenes that do not require the effects of lighting, such as billboards or ground guidance. It's not quite suitable for low-poly or color-card-textured models, like the mecha bee in this demo.

```glsl
void main()
{
vec4 o = mainColor; // Material color
return CCFragOutput(o);
}
```
## Lambert Model
The Lambert model is a lighting model that describes diffuse reflection, assuming that the surface of an object reflects light independent of the viewer's position. This model is commonly used to simulate non-metallic, non-mirrored object surfaces.

```glsl

void Lambert(inout vec4 diffuseColor, in vec3 normal)
{
vec3 N = normalize(normal);
vec3 L = normalize(cc_mainLitDir.xyz * -1.0);
float NL = max(dot(N, L), 0.0);
vec3 diffuse = NL * (diffuseColor.rgb * cc_mainLitColor.xyz);
vec3 ambient = cc_ambientGround.rgb * diffuseColor.rgb * cc_ambientSky.w;
diffuseColor.rgb = ambient + diffuse;
}
```
## Half Lambert Model
The Half Lambert model is a variant of the Lambert model. It changes the interpretation of light reflection so that when the light is at a 90-degree angle to the normal, the reflection intensity is 0.5 instead of 0, making the shadow part not so dark. This model is often used for cartoon or non-realistic rendering.

```glsl
void HalfLambert(inout vec4 diffuseColor, in vec3 normal)
{
vec3 N = normalize(normal);
vec3 L = normalize(cc_mainLitDir.xyz * -1.0);
float NL = max(dot(N, L), 0.0);
vec3 diffuse = pow(NL * diffuseWrap + (1.-diffuseWrap),2.0) * (diffuseColor.rgb * cc_mainLitColor.xyz);
vec3 ambient = cc_ambientGround.rgb * diffuseColor.rgb * cc_ambientSky.w;
diffuseColor.rgb = ambient + diffuse;
}
```

## Blinn-Phong Model
The Blinn-Phong model is an improved version of the Phong model. It introduces the concept of "half vector", making the calculation of specular highlights closer to the micro-surface theory. It is suitable for simulating glossy object surfaces.

```glsl
void blinnPhong(inout vec4 diffuseColor, in vec3 normal)
{
vec3 N = normalize(normal);
vec3 L = normalize(cc_mainLitDir.xyz * -1.0);
float NL = max(dot(N, L), 0.0);
vec3 diffuse = NL * diffuseColor.rgb * cc_mainLitColor.xyz;
vec3 position;
HIGHP_VALUE_FROM_STRUCT_DEFINED(position, v_position);
vec3 cameraPosition = cc_cameraPos.xyz / cc_cameraPos.w;
vec3 V = normalize(cameraPosition - position);
vec3 H = normalize(L + V);
float specularFactor = pow(max(0.0, dot(H,N)), bpParams.x * 50.);
vec3 specular = (specularFactor * cc_ambientSky.rgb * cc_mainLitColor.xyz);
float shadowCtrl = 1.0;
#if CC_RECEIVE_SHADOW && CC_SHADOW_TYPE == CC_SHADOW_MAP
if (NL > 0.0) {
#if CC_DIR_LIGHT_SHADOW_TYPE == CC_DIR_LIGHT_SHADOW_CASCADED
shadowCtrl = CCCSMFactorBase(position, N, v_shadowBias);
#endif
#if CC_DIR_LIGHT_SHADOW_TYPE == CC_DIR_LIGHT_SHADOW_UNIFORM
shadowCtrl = CCShadowFactorBase(CC_SHADOW_POSITION, N, v_shadowBias);
#endif
}
#endif
diffuse = (diffuse + specular) * (shadowCtrl);
}
```
## Toon Model
The Toon model, or Cel-shading, discretizes the light intensity into several levels to simulate the effect of hand-drawn animation. It is suitable for cartoon or art style rendering.

```glsl

void ToonShading (inout vec4 diffuseColor, in vec3 normal) {
    vec3 position;
    HIGHP_VALUE_FROM_STRUCT_DEFINED(position, v_position);
    vec3 V = normalize(cc_cameraPos.xyz - position);
    vec3 N = normalize(normal);
    vec3 L = normalize(-cc_mainLitDir.xyz);
    float NL = 0.5 * dot(N, L) + 0.5;
    float NH = 0.5 * dot(normalize(V + L), N) + 0.5;
    vec3 lightColor = cc_mainLitColor.rgb * (cc_mainLitColor.w * shadeParams.x);
    float shadeFeather = shadeParams.y;
    float shadeCtrl = mix(1., (1.-shadeParams.z), clamp(1.0 + (shadeParams.x - shadeFeather - NL) / shadeFeather, 0.0, 1.0));
    shadeCtrl *= mix(1., (1.-shadeParams.z*0.5), clamp(1.0 + (shadeParams.w - shadeFeather - NL) / shadeFeather, 0.0, 1.0));
    float specularWeight = 1.0 - pow(specularParams.x, 5.0);
    float specularMask = 1.0-smoothstep( NH, NH+ specularParams.y, specularWeight + EPSILON_LOWP);
    float shadowCtrl = 1.0;
    #if CC_RECEIVE_SHADOW && CC_SHADOW_TYPE == CC_SHADOW_MAP
      if (NL > 0.0) {
      #if CC_DIR_LIGHT_SHADOW_TYPE == CC_DIR_LIGHT_SHADOW_CASCADED
        shadowCtrl = CCCSMFactorBase(position, N, v_shadowBias+0.1);
      #endif
      #if CC_DIR_LIGHT_SHADOW_TYPE == CC_DIR_LIGHT_SHADOW_UNIFORM
        shadowCtrl = CCShadowFactorBase(CC_SHADOW_POSITION, N, v_shadowBias+0.1);
      #endif
      }
    #endif
    float diffuseCtrl = (shadowCtrl+specularMask*specularParams.z)*shadeCtrl;
    vec3 envColor = cc_ambientGround.rgb*cc_ambientSky.w;
    diffuseColor.rgb *= (envColor + (lightColor*diffuseCtrl));
  }
}
```
## PBR (Physically Based Rendering)
PBR is the latest lighting model, which tries to more realistically simulate the interaction between light and the surface of an object, including diffuse and specular reflection. PBR models usually include principles of physics like energy conservation and Fresnel effect, and they are suitable for simulating rendering in the real world.

PBR's GLSL code is quite long, typically including calculations for multiple physical characteristics, such as roughness, metallicity, etc. Therefore, the complete PBR GLSL code is not provided here.

Also, since this model does not have PBR textures, the effect is not significantly different from Blinn-Phong.
