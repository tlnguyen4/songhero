// set the precision of the float values (necessary if using float)
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
precision mediump int;

// flag for using soft shadows
#define SOFT_SHADOWS 0

// define constant parameters
// EPS is for the precision issue
#define INFINITY 1.0e+12
#define EPS 1.0e-3

// define maximum recursion depth for rays
#define MAX_RECURSION 8

// define constants for scene setting
#define MAX_LIGHTS 10

// define texture types
#define NONE 0
#define CHECKERBOARD 1
#define MYSPECIAL 2

// define material types
#define BASICMATERIAL 1
#define PHONGMATERIAL 2
#define LAMBERTMATERIAL 3

// define reflect types - how to bounce rays
#define NONEREFLECT 1
#define MIRRORREFLECT 2
#define GLASSREFLECT 3

struct Shape {
  int shapeType;
  vec3 v1;
  vec3 v2;
  float rad;
};

struct Material {
  int materialType;
  vec3 color;
  float shininess;
  vec3 specular;

  int materialReflectType;
  float reflectivity;
  float refractionRatio;
  int special;
};

struct Object {
  Shape shape;
  Material material;
};

struct Light {
  vec3 position;
  vec3 color;
  float intensity;
  float attenuate;
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Intersection {
  vec3 position;
  vec3 normal;
};

// uniform
uniform mat4 uMVMatrix;
uniform int frame;
uniform float height;
uniform float width;
uniform vec3 camera;
uniform int numObjects;
uniform int numLights;
uniform Light lights[MAX_LIGHTS];
uniform vec3 objectNorm;

// varying
varying vec2 v_position;

// find then position some distance along a ray
vec3 rayGetOffset(Ray ray, float dist) {
  return ray.origin + (dist * ray.direction);
}

// if a newly found intersection is closer than the best found so far, record
// the new intersection and return true; otherwise leave the best as it was and
// return false.
bool chooseCloserIntersection(float dist, inout float best_dist,
                              inout Intersection intersect,
                              inout Intersection best_intersect) {
  if (best_dist <= dist)
    return false;
  best_dist = dist;
  best_intersect.position = intersect.position;
  best_intersect.normal = intersect.normal;
  return true;
}

// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}


// put any general convenience functions you want up here
// ----------- STUDENT CODE BEGIN ------------
float checkInsideSide(Ray ray, vec3 t1, vec3 t2, vec3 p) {
  vec3 v1 = t1 - p;
  vec3 v2 = t2 - p;
  vec3 n1 = cross(v2, v1);
  if (dot(ray.direction, n1) < EPS) {
    return INFINITY;
  }
  return EPS;
}

float checkInsideSquare(Ray ray, vec3 p1, vec3 p2, vec3 p3, vec3 p4, vec3 p) {
  float side1 = checkInsideSide(ray, p1, p2, p);
  if (side1 == INFINITY) {
    return INFINITY;
  }
  float side2 = checkInsideSide(ray, p2, p3, p);
  if (side2 == INFINITY) {
    return INFINITY;
  }
  float side3 = checkInsideSide(ray, p3, p4, p);
  if (side3 == INFINITY) {
    return INFINITY;
  }
  float side4 = checkInsideSide(ray, p4, p1, p);
  if (side4 == INFINITY) {
    return INFINITY;
  }

  return EPS;
}

vec2 quadraticFormula(float A, float B, float C) {
  vec2 its = vec2(0.0, 0.0);
  float x = B * B - 4.0 * A * C;
  if (x < EPS) {
    return vec2(EPS, EPS);
  }
  its.x = (-B + sqrt(x)) / (2.0 * A);
  its.y = (-B - sqrt(x)) / (2.0 * A);

  return its;
}

float checkIntersection(vec2 its, float len, float len1, float len2) {
    // if both is negative
  if (len1 < EPS && len2 < EPS) {
    return INFINITY;
  }

  // if both is positive
  if (len1 >= EPS && len2 >= EPS) {
    if (len1 > len && len2 > len) {
      return INFINITY;
    }
    else if (len1 <= len && len2 > len) {
      return 1.0;
    }
    else if (len2 <= len && len1 > len) {
      return EPS;
    }
    else if (len1 <= len && len2 <= len) {
      if (its.x <= its.y) {
        return 1.0;
      }
      else {
        return EPS;
      }
    }
    else {
      return INFINITY;
    }
  }

  // if 1 is positive and 1 is negative
  if (len1 >= EPS && len2 < EPS) {
    if (len1 <= len) {
      return 1.0;
    }
    else {
      return INFINITY;
    }
  }

  if (len2 >= EPS && len1 < EPS) {
    if (len2 <= len) {
      return EPS;
    }
    else {
      return INFINITY; 
    }
  }

  return INFINITY;
}
// ----------- STUDENT CODE END ------------

// forward declaration
float rayIntersectScene(Ray ray, out Material out_mat,
                        out Intersection out_intersect);

// Plane
// this function can be used for plane, triangle, and box
float findIntersectionWithPlane(Ray ray, vec3 norm, float dist,
                                out Intersection intersect) {
  float a = dot(ray.direction, norm);
  float b = dot(ray.origin, norm) - dist;

  if (a < EPS && a > -EPS)
    return INFINITY;

  float len = -b / a;
  if (len < EPS)
    return INFINITY;

  intersect.position = rayGetOffset(ray, len);
  intersect.normal = norm;
  return len;
}

// Triangle
float findIntersectionWithTriangle(Ray ray, vec3 t1, vec3 t2, vec3 t3,
                                   out Intersection intersect) {
  vec3 norm =  normalize(cross(t2 - t1, t3 - t1));
  float d =  norm.x * t1.x + norm.y * t1.y + norm.z * t1.z;

  float len = findIntersectionWithPlane(ray, norm, d, intersect);
  if (len >= INFINITY) {
    return INFINITY;
  }
  
  vec3 p = rayGetOffset(ray, len);

  // Side 1
  if (checkInsideSide(ray, t1, t2, p) == INFINITY) {
    return INFINITY;
  }
  // Side 2
  if (checkInsideSide(ray, t2, t3, p) == INFINITY) {
    return INFINITY;
  }
  // Side 3
  if (checkInsideSide(ray, t3, t1, p) == INFINITY) {
    return INFINITY;
  }

  intersect.position = p;
  intersect.normal = norm;
  return len;
}

// Sphere
float findIntersectionWithSphere(Ray ray, vec3 center, float radius,
                                 out Intersection intersect) {
  vec3 L = center - ray.origin;

  float tca = dot(L, ray.direction);
  if (tca < EPS) {
    return INFINITY;
  }
  float d2 = dot(L, L) - tca * tca;
  if (d2 > (radius * radius)) {
    return INFINITY;
  }

  float thc = sqrt(radius * radius - d2);
  float t1 = tca - thc;
  float t2 = tca + thc;

  if (t1 > EPS) {
    vec3 p = rayGetOffset(ray, t1);
    intersect.position = p;
    intersect.normal = (p - center) / length(p - center);
    return t1;
  }
  else if (t2 > EPS) {
    vec3 p = rayGetOffset(ray, t2);
    intersect.position = p;
    intersect.normal = (p - center) / length(p - center);
    return t2;
  }
  return INFINITY;
}

// Box helper function - find intersection with each side of box
float findIntersectionWithSquare(Ray ray, vec3 p1, vec3 p2, vec3 p3, vec3 p4, out Intersection intersect) {
  vec3 norm = normalize(cross(p2 - p1, p4 - p1));
  float d = dot(p1, norm);
  float dist = findIntersectionWithPlane(ray, norm, d, intersect);

  if (dist >= INFINITY) {
    return INFINITY;
  }

  vec3 p = rayGetOffset(ray, dist);
  if (checkInsideSquare(ray, p1, p2, p3, p4, p) == INFINITY) {
    return INFINITY;
  }

  intersect.position = p;
  intersect.normal = norm;
  return dist;
}

// Box
float findIntersectionWithBox(Ray ray, vec3 pmin, vec3 pmax,
                              out Intersection out_intersect) {
  // ----------- STUDENT CODE BEGIN ------------
  Intersection intersect;
  float best_dist = INFINITY;
  float dist;
  vec3 p1;
  vec3 p2;
  vec3 p3;
  vec3 p4;

  // Side 1
  p1 = vec3(pmin.x, pmin.y, pmax.z);
  p2 = vec3(pmax.x, pmin.y, pmax.z);
  p3 = pmax;
  p4 = vec3(pmin.x, pmax.y, pmax.z);
  dist = findIntersectionWithSquare(ray, p1, p2, p3, p4, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // Side 2
  p1 = vec3(pmax.x, pmin.y, pmax.z);
  p2 = vec3(pmax.x, pmin.y, pmin.z);
  p3 = vec3(pmax.x, pmax.y, pmin.z);
  p4 = pmax;
  dist = findIntersectionWithSquare(ray, p1, p2, p3, p4, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // Side 3
  p1 = vec3(pmax.x, pmin.y, pmin.z);
  p2 = pmin;
  p3 = vec3(pmin.x, pmax.y, pmin.z);
  p4 = vec3(pmax.x, pmax.y, pmin.z);
  dist = findIntersectionWithSquare(ray, p1, p2, p3, p4, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // Side 4
  p1 = pmin;
  p2 = vec3(pmin.x, pmin.y, pmax.z);
  p3 = vec3(pmin.x, pmax.y, pmax.z);
  p4 = vec3(pmin.x, pmax.y, pmin.z);
  dist = findIntersectionWithSquare(ray, p1, p2, p3, p4, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // Side 5
  p1 = vec3(pmin.x, pmax.y, pmax.z);
  p2 = pmax;
  p3 = vec3(pmax.x, pmax.y, pmin.z);
  p4 = vec3(pmin.x, pmax.y, pmin.z);
  dist = findIntersectionWithSquare(ray, p1, p2, p3, p4, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // Side 6
  p1 = vec3(pmin.x, pmin.y, pmax.z);
  p2 = pmin;
  p3 = vec3(pmax.x, pmin.y, pmin.z);
  p4 = vec3(pmax.x, pmin.y, pmax.z);
  dist = findIntersectionWithSquare(ray, p1, p2, p3, p4, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  return best_dist;
  // ----------- STUDENT CODE END ------------
}

// Cylinder
float getIntersectOpenCylinder(Ray ray, vec3 pa, vec3 va, float len,
                               float r, out Intersection intersect) {
  vec3 v = normalize(ray.direction);
  vec3 p = ray.origin;
  va = normalize(va);
  float vva = dot(v, va);
  vec3 deltap = p - pa;
  float A = dot(v - vva * va, v - vva * va);
  float B = 2.0 * dot(v - vva * va, deltap - dot(deltap, va) * va);
  float C = dot(deltap - dot(deltap, va) * va, deltap - dot(deltap, va) * va) - (r * r);

  // Use quadratic formula to find point of intersections
  vec2 its = quadraticFormula(A, B, C);
  if (its.x <= EPS && its.y <= EPS) {
    return INFINITY;
  }

  if (its.x > EPS && its.y <= EPS) {
    vec3 p1 = rayGetOffset(ray, its.x);
    vec3 pap1 = p1 - pa;
    float len1 = dot(va, pap1);
    if (len1 <= len) {
      intersect.position = p1;
      intersect.normal = normalize(pap1 - len1 * va);
      return its.x;
    }
    return INFINITY;
  }

  if (its.y > EPS && its.y <= EPS) {
    vec3 p2 = rayGetOffset(ray, its.y);
    vec3 pap2 = p2 - pa;
    float len2 = dot(va, pap2);
    if (len2 <= len) {
      intersect.position = p2;
      intersect.normal = normalize(pap2 - len2 * va);
      return its.y;
    }
    return INFINITY;
  }

  if (its.x > EPS && its.y > EPS) {
    vec3 p1 = rayGetOffset(ray, its.x);
    vec3 p2 = rayGetOffset(ray, its.y);
    vec3 pap1 = p1 - pa;
    vec3 pap2 = p2 - pa;
    float len1 = dot(va, pap1);
    float len2 = dot(va, pap2);

    float check = checkIntersection(its, len, len1, len2);
    if (check == INFINITY) {
      return INFINITY;
    }
    if (check == 1.0) {
      intersect.position = p1;
      intersect.normal = normalize(pap1 - len1 * va);
      return its.x;
    }
    else {
      intersect.position = p2;
      intersect.normal = normalize(pap2 - len2 * va);
      return its.y;
    }
    return INFINITY;
  }
}

float getIntersectDisc(Ray ray, vec3 center, vec3 norm, float rad,
                       out Intersection intersect) {
  
  float d = dot(norm, center);
  float dist = findIntersectionWithPlane(ray, norm, d, intersect);
  if (dist > INFINITY) {
    return INFINITY;
  }

  vec3 p = rayGetOffset(ray, dist);
  if (length(center - p) <= rad) {
    intersect.position = p;
    intersect.normal = -1.0 * norm;
    return dist;
  }

  return INFINITY;
}

float findIntersectionWithCylinder(Ray ray, vec3 center, vec3 apex,
                                   float radius,
                                   out Intersection out_intersect) {
  vec3 axis = apex - center;
  float len = length(axis);
  axis = normalize(axis);

  Intersection intersect;
  float best_dist = INFINITY;
  float dist;

  // -- infinite cylinder
  dist = getIntersectOpenCylinder(ray, center, axis, len, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // -- two caps
  dist = getIntersectDisc(ray, center, -axis, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);
  dist = getIntersectDisc(ray, apex, axis, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);
  return best_dist;
}

// Cone
float getIntersectOpenCone(Ray ray, vec3 pa, vec3 va, float len,
                           float radius, out Intersection intersect) {
  float alpha = atan(radius / len);
  vec3 p = ray.origin;
  vec3 v = ray.direction;
  va = normalize(va);
  float vva = dot(v, va);
  vec3 deltap = p - pa;
  float A = pow(cos(alpha), 2.0) * dot(v - vva * va, v - vva * va) - pow(sin(alpha), 2.0) * pow(vva, 2.0);
  float B = 2.0 * pow(cos(alpha), 2.0) * dot(v - vva * va, deltap - dot(deltap, va) * va) - 2.0 * pow(sin(alpha), 2.0) * vva * dot(deltap, va);
  float C = pow(cos(alpha), 2.0) * dot(deltap - dot(deltap, va) * va, deltap - dot(deltap, va) * va) - pow(sin(alpha), 2.0) * pow(dot(deltap, va), 2.0);

  // Use quadratic formula to find point of intersections
  vec2 its = quadraticFormula(A, B, C);
  if (its.x <= EPS && its.y <= EPS) {
    return INFINITY;
  }
  
  vec3 p1 = rayGetOffset(ray, its.x);
  vec3 p2 = rayGetOffset(ray, its.y);
  vec3 pap1 = p1 - pa;
  vec3 pap2 = p2 - pa;
  float len1 = dot(va, pap1);
  float len2 = dot(va, pap2);

  float check = checkIntersection(its, len, len1, len2);
  if (check == INFINITY) {
    return INFINITY;
  }
  if (check == 1.0) {
    vec3 e = p1 - pa;
    intersect.position = p1;
    intersect.normal = normalize(e - length(e) / cos(alpha) * va);
    return its.x;
  }
  vec3 e = p2 - pa;
  intersect.position = p2;
  intersect.normal = normalize(e - length(e) / cos(alpha) * va);
  return its.y;
}

float findIntersectionWithCone(Ray ray, vec3 center, vec3 apex, float radius,
                               out Intersection out_intersect) {
  vec3 axis = center - apex;
  float len = length(axis);
  axis = normalize(axis);

  // -- infinite cone
  Intersection intersect;
  float best_dist = INFINITY;
  float dist;

  // -- infinite cone
  dist = getIntersectOpenCone(ray, apex, axis, len, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  // -- caps
  dist = getIntersectDisc(ray, center, axis, radius, intersect);
  chooseCloserIntersection(dist, best_dist, intersect, out_intersect);

  return best_dist;
}

vec3 calculateSpecialDiffuseColor(Material mat, vec3 posIntersection,
                                  vec3 normalVector) {
  // ----------- STUDENT CODE BEGIN ------------
  if (mat.special == CHECKERBOARD) {
    float newX = posIntersection.x;
    float newY = posIntersection.y;
    if (abs(normalVector.x) >= abs(normalVector.y) && abs(normalVector.x) >= abs(normalVector.z)) {
      newX = posIntersection.z;
    }
    else if (abs(normalVector.y) >= abs(normalVector.x) && abs(normalVector.y) >= abs(normalVector.z)) {
      newY = posIntersection.z;
    }
    float place = floor(newX / 8.0 + EPS) + floor(newY / 8.0 + EPS);
    if (mod(place, 2.0) <= EPS) {
      return mat.color * 0.3;
    }
    return mat.color;

  } else if (mat.special == MYSPECIAL) {
    vec3 v = posIntersection * 0.21;
    float t = (1.5 * v.x + 2.5 * v.y + 3.5 * v.z);
    t += 2.1 * snoise(v);
    return vec3(sqrt(abs(sin(t))) * 0.3, 0.0, sqrt(abs(tan(t))) * 0.3);
  }

  // If not a special material, just return material color.
  return mat.color;
  // ----------- STUDENT CODE END ------------
}

vec3 calculateDiffuseColor(Material mat, vec3 posIntersection,
                           vec3 normalVector) {
  // Special colors
  if (mat.special != NONE) {
    return calculateSpecialDiffuseColor(mat, posIntersection, normalVector);
  }
  return vec3(mat.color);
}

// check if position pos in in shadow with respect to a particular light.
// lightVec is the vector from that position to that light -- it is not
// normalized, so its length is the distance from the position to the light
bool pointInShadow(vec3 pos, vec3 lightVec) {
  return false;
}

// use random sampling to compute a ratio that represents the
// fractional contribution of the light to the position pos.
// lightVec is the vector from that position to that light -- it is not
// normalized, so its length is the distance from the position to the light
float softShadowRatio(vec3 pos, vec3 lightVec) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 1 lines of code.
  return 0.0;
  // ----------- STUDENT CODE END ------------
}

vec3 getLightContribution(Light light, Material mat, vec3 posIntersection,
                          vec3 normalVector, vec3 eyeVector, bool phongOnly,
                          vec3 diffuseColor) {
  vec3 lightVector = light.position - posIntersection;

  // check if point is in shadow with light vector
  if (pointInShadow(posIntersection, lightVector)) {
    return vec3(0.0, 0.0, 0.0);
  }

  // normalize the light vector for the computations below
  float distToLight = length(lightVector);
  lightVector /= distToLight;

  if (mat.materialType == PHONGMATERIAL ||
      mat.materialType == LAMBERTMATERIAL) {
    vec3 contribution = vec3(0.0, 0.0, 0.0);

    // get light attenuation
    float attenuation = light.attenuate * distToLight;
    float diffuseIntensity =
        max(0.0, dot(normalVector, lightVector)) * light.intensity;

    // glass and mirror objects have specular highlights but no diffuse lighting
    if (!phongOnly) {
      contribution +=
          diffuseColor * diffuseIntensity * light.color / attenuation;
    }

    if (mat.materialType == PHONGMATERIAL) {
      // Start with just black by default (i.e. no Phong term contribution)
      vec3 phongTerm = vec3(0.0, 0.0, 0.0);
      // ----------- STUDENT CODE BEGIN ------------
      vec3 R = normalize(reflect(-lightVector, normalVector));
      float cosAlpha = dot(R, normalize(eyeVector));
      cosAlpha = cosAlpha < EPS ? 0.0 : cosAlpha;
      cosAlpha = pow(cosAlpha, mat.shininess);
      phongTerm += mat.specular * cosAlpha * light.intensity;
      // phongTerm = phongTerm;
      // ----------- STUDENT CODE END ------------
      contribution += phongTerm / attenuation;
    }

    return contribution;
  } else {
    return diffuseColor;
  }
}

vec3 calculateColor(Material mat, vec3 posIntersection, vec3 normalVector,
                    vec3 eyeVector, bool phongOnly) {
  // The diffuse color of the material at the point of intersection
  // Needed to compute the color when accounting for the lights in the scene
  vec3 diffuseColor = calculateDiffuseColor(mat, posIntersection, normalVector);

  // color defaults to black when there are no lights
  vec3 outputColor = vec3(0.0, 0.0, 0.0);

  // Loop over the MAX_LIGHTS different lights, taking care not to exceed
  // numLights (GLSL restriction), and accumulate each light's contribution
  // to the point of intersection in the scene.
  // ----------- STUDENT CODE BEGIN ------------
  for (int i = 0; i < MAX_LIGHTS; i++) {
    if (i >= numLights) {
      break;
    }

    Light currLight = lights[i];
    vec3 lightContribution = getLightContribution(currLight, mat, posIntersection, normalVector, eyeVector, phongOnly, diffuseColor);
    outputColor = outputColor + lightContribution;
  }
  // Return diffuseColor by default, so you can see something for now.
  // return diffuseColor;
  return outputColor;
  // ----------- STUDENT CODE END ------------
}

// find reflection or refraction direction (depending on material type)
vec3 calcReflectionVector(Material material, vec3 direction, vec3 normalVector,
                          bool isInsideObj) {
  if (material.materialReflectType == MIRRORREFLECT) {
    return reflect(direction, normalVector);
  }
  // If it's not mirror, then it is a refractive material like glass.
  // Compute the refraction direction.
  // See lecture 13 slide (lighting) on Snell's law.
  // The eta below is eta_i/eta_r.
  // ----------- STUDENT CODE BEGIN ------------
  // return reflect(direction, normalVector);
  float eta =
      (isInsideObj) ? 1.0 / material.refractionRatio : material.refractionRatio;
  
  float cos1 = -dot(normalVector, normalize(direction));
  float sin2 = eta * sqrt(1.0 - cos1 * cos1);
  float cos2 = sqrt(1.0 - sin2 * sin2);
  vec3 refract = eta * direction + (eta * cos1 - cos2) * normalVector;
  return refract;
  // ----------- STUDENT CODE END ------------
}

// float rayIntersectScene(Ray ray, out Material out_mat, out Intersection out_intersect);

vec3 traceRay(Ray ray) {
  // Accumulate the final color from tracing this ray into resColor.
  vec3 resColor = vec3(0.0, 0.0, 0.0);

  // Accumulate a weight from tracing this ray through different materials
  // based on their BRDFs. Initially all 1.0s (i.e. scales the initial ray's
  // RGB color by 1.0 across all color channels). This captures the BRDFs
  // of the materials intersected by the ray's journey through the scene.
  vec3 resWeight = vec3(1.0, 1.0, 1.0);

  // Flag for whether the ray is currently inside of an object.
  bool isInsideObj = false;

  // Iteratively trace the ray through the scene up to MAX_RECURSION bounces.
  for (int depth = 0; depth < MAX_RECURSION; depth++) {
    // Fire the ray into the scene and find an intersection, if one exists.
    //
    // To do so, trace the ray using the rayIntersectScene function, which
    // also accepts a Material struct and an Intersection struct to store
    // information about the point of intersection. The function returns
    // a distance of how far the ray travelled before it intersected an object.
    //
    // Then, check whether or not the ray actually intersected with the scene.
    // A ray does not intersect the scene if it intersects at a distance
    // "equal to zero" or far beyond the bounds of the scene. If so, break
    // the loop and do not trace the ray any further.
    // (Hint: You should probably use EPS and INFINITY.)
    // ----------- STUDENT CODE BEGIN ------------
    Material hitMaterial;
    Intersection intersect;
    float dist = rayIntersectScene(ray, hitMaterial, intersect);
    if (abs(dist) < EPS || abs(dist) >= INFINITY) {
      break;
    }
    // ----------- STUDENT CODE END ------------

    // Compute the vector from the ray towards the intersection.
    vec3 posIntersection = intersect.position;
    vec3 normalVector    = intersect.normal;

    vec3 eyeVector = normalize(ray.origin - posIntersection);

    // Determine whether we are inside an object using the dot product
    // with the intersection's normal vector
    if (dot(eyeVector, normalVector) < EPS) {
        normalVector = -normalVector;
        isInsideObj = true;
    } else {
        isInsideObj = false;
    }

    // Material is reflective if it is either mirror or glass in this assignment
    bool reflective = (hitMaterial.materialReflectType == MIRRORREFLECT ||
                       hitMaterial.materialReflectType == GLASSREFLECT);

    // Compute the color at the intersection point based on its material
    // and the lighting in the scene
    vec3 outputColor = calculateColor(hitMaterial, posIntersection,
      normalVector, eyeVector, reflective);

    // A material has a reflection type (as seen above) and a reflectivity
    // attribute. A reflectivity "equal to zero" indicates that the material
    // is neither reflective nor refractive.

    // If a material is neither reflective nor refractive...
    // (1) Scale the output color by the current weight and add it into
    //     the accumulated color.
    // (2) Then break the for loop (i.e. do not trace the ray any further).
    // ----------- STUDENT CODE BEGIN ------------
    if (abs(hitMaterial.reflectivity) < EPS) {
      resColor.xyz += outputColor.xyz * resWeight.xyz;
      break;
    }
    // ----------- STUDENT CODE END ------------

    // If the material is reflective or refractive...
    // (1) Use calcReflectionVector to compute the direction of the next
    //     bounce of this ray.
    // (2) Update the ray object with the next starting position and
    //     direction to prepare for the next bounce. You should modify the
    //     ray's origin and direction attributes. Be sure to normalize the
    //     direction vector.
    // (3) Scale the output color by the current weight and add it into
    //     the accumulated color.
    // (4) Update the current weight using the material's reflectivity
    //     so that it is the appropriate weight for the next ray's color.
    // ----------- STUDENT CODE BEGIN ------------
    
    vec3 nextBounceDir = calcReflectionVector(hitMaterial, ray.direction, normalVector, isInsideObj);
    ray.origin = posIntersection;
    ray.direction = normalize(nextBounceDir);
    resColor.xyz += outputColor.xyz * resWeight.xyz;
    resWeight *= hitMaterial.reflectivity;
    // ----------- STUDENT CODE END ------------
  }

  return resColor;
}

void main() {
  float cameraFOV = 0.8;
  vec3 direction = vec3(v_position.x * cameraFOV * width / height,
                        v_position.y * cameraFOV, 1.0);

  Ray ray;
  ray.origin = vec3(uMVMatrix * vec4(camera, 1.0));
  ray.direction = normalize(vec3(uMVMatrix * vec4(direction, 0.0)));

  // trace the ray for this pixel
  vec3 res = traceRay(ray);

  // paint the resulting color into this pixel
  gl_FragColor = vec4(res.x, res.y, res.z, 1.0);
}
