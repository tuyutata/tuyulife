// 本产品配置需求的公开入口；只登记名称、类型和规则，不保存配置值。
export const manifest=Object.freeze({
  "schema": 1,
  "product_id": "tuyulife",
  "configuration": {
    "id": "tuyulife",
    "kind": "tuyu",
    "title": "途遇生活配置",
    "items": [
      {"environment":"tuyulife-release","name":"APP_KEY","title":"APP_KEY","description":"生活端 Android 正式签名材料","revealable":false,"accessLevel":"protected","kind":"android-signing"},
      {"environment":"tuyulife-release","name":"IOS_KEY","title":"IOS_KEY","description":"生活端 iOS 正式签名证书","revealable":false,"accessLevel":"protected","kind":"ios-signing"},
      {"environment":"tuyulife-release","name":"APP_PROFILE","title":"APP_PROFILE","description":"生活端 iOS 正式描述文件","revealable":false,"accessLevel":"protected","kind":"ios-signing"}
    ]
  }
});
export function describeConfiguration(){return JSON.parse(JSON.stringify(manifest));}
