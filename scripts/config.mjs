// 本产品配置需求的公开入口；只登记名称、类型和规则，不保存配置值。
export const manifest=Object.freeze({
  "schema": 1,
  "product_id": "tuyulife",
  "configuration": {
    "id": "tuyulife",
    "kind": "tuyu",
    "title": "途遇生活配置",
    "items": [
      {
        "name": "APP_KEY",
        "description": "安卓应用正式签名材料",
        "accessLevel": "protected",
        "kind": "android-signing",
        "format": "不适用"
      },
      {
        "name": "IOS_KEY",
        "description": "苹果移动应用正式签名证书",
        "accessLevel": "protected",
        "kind": "ios-signing",
        "format": "不适用"
      },
      {
        "name": "TUYULIFE_PROFILE",
        "description": "途遇生活描述文件",
        "accessLevel": "protected",
        "kind": "ios-signing",
        "format": "ios_profile:com.tuyulife"
      }
    ]
  }
});
export function describeConfiguration(){return JSON.parse(JSON.stringify(manifest));}

// 本产品Workflow坐标声明。
export const workflows=Object.freeze({"ios":"ios.yml","android":"android.yml"});

// 只返回声明数据；派发与观察归通用调用方，版本及交付归本仓YAML。
export function describeAction({flow,platform,inputs={}}){
 const workflow=workflows[platform];
 if(flow==='release'&&workflow)return {repository:"tuyutata/tuyulife",workflow,ref:'main',inputs};
 throw Error('本产品未声明该流程：'+flow+'·'+platform);
}
