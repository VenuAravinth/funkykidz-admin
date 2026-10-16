export const AUTH_ENDPOINTS = {
  folder: "auth",
  actions: {
    login: "login",
    register: "register",
    forgotPassword: "forgotPassword",
    me: "me",
    logout: "logout",
    mfaSetupSendOtp: "mfaSetupSendOtp",
    mfaSetupVerifyOtp: "mfaSetupVerifyOtp",
    mfaSetupInit: "mfaSetupInit",
    mfaSetupConfirm: "mfaSetupConfirm",
    mfaVerify: "mfaVerify",
    mfaLoginSendOtp: "mfaLoginSendOtp",
    mfaLoginVerifyOtp: "mfaLoginVerifyOtp",
  },
} as const;

export const PRODUCT_ENDPOINTS = {
  folder: "products",
  actions: {
    uploadImage: "uploadImage",
    signImageUrls: "signImageUrls",
    list: "list",
    get: "get",
    create: "create",
    update: "update",
    remove: "remove",
    setPublished: "setPublished",
    adjustStock: "adjustStock",
    regenerateBarcodes: "regenerateBarcodes",
    aiAnalyzeImage: "aiAnalyzeImage",
  },
} as const;

export const CATEGORY_ENDPOINTS = {
  folder: "categories",
  actions: {
    list: "list",
    create: "create",
    update: "update",
    remove: "remove",
  },
} as const;

export const BRAND_ENDPOINTS = {
  folder: "brands",
  actions: {
    list: "list",
    create: "create",
    update: "update",
    remove: "remove",
  },
} as const;
