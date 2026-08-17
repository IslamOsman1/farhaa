export const STUDIO_BRIDGE_MESSAGE_TYPE = 'FARHA_STUDIO_BRIDGE';
export const STUDIO_BRIDGE_VERSION = '2.0.0';

export const STUDIO_BRIDGE_SOURCE = {
  parent: 'studio-parent',
  frame: 'studio-frame',
};

export const STUDIO_BRIDGE_EVENT = {
  renderConfig: 'render-config',
  requestCatalogs: 'request-catalogs',
  setAddMode: 'set-add-mode',
  selectNativeElement: 'select-native-element',
  selectTemplateText: 'select-template-text',
  syncNativeElement: 'sync-native-element',
  syncTheme: 'sync-theme',
  syncTextOverride: 'sync-text-override',
  syncTextStyle: 'sync-text-style',
  syncCustomElements: 'sync-custom-elements',
  templateTextSelect: 'template-text-select',
  textOverride: 'text-override',
  textStyleOverride: 'text-style-override',
  customElementSelect: 'custom-element-select',
  customElementUpdate: 'custom-element-update',
  customElementDelete: 'custom-element-delete',
  nativeElementSelect: 'native-element-select',
  nativeElementUpdate: 'native-element-update',
  editField: 'edit-field',
};

const LEGACY_EVENT_BY_TYPE = {
  FARHA_RENDER_CONFIG: STUDIO_BRIDGE_EVENT.renderConfig,
  FARHA_REQUEST_STUDIO_CATALOGS: STUDIO_BRIDGE_EVENT.requestCatalogs,
  FARHA_EDITOR_ADD_MODE: STUDIO_BRIDGE_EVENT.setAddMode,
  FARHA_SELECT_NATIVE_ELEMENT: STUDIO_BRIDGE_EVENT.selectNativeElement,
  FARHA_SELECT_TEMPLATE_TEXT: STUDIO_BRIDGE_EVENT.selectTemplateText,
  FARHA_NATIVE_ELEMENT_UPDATE: STUDIO_BRIDGE_EVENT.syncNativeElement,
  FARHA_THEME_UPDATE: STUDIO_BRIDGE_EVENT.syncTheme,
  FARHA_TEXT_OVERRIDE: STUDIO_BRIDGE_EVENT.textOverride,
  FARHA_TEXT_STYLE_OVERRIDE: STUDIO_BRIDGE_EVENT.textStyleOverride,
  FARHA_CUSTOM_ELEMENTS_SYNC: STUDIO_BRIDGE_EVENT.syncCustomElements,
  FARHA_TEMPLATE_TEXT_SELECT: STUDIO_BRIDGE_EVENT.templateTextSelect,
  FARHA_CUSTOM_ELEMENT_SELECT: STUDIO_BRIDGE_EVENT.customElementSelect,
  FARHA_CUSTOM_ELEMENT_UPDATE: STUDIO_BRIDGE_EVENT.customElementUpdate,
  FARHA_CUSTOM_ELEMENT_DELETE: STUDIO_BRIDGE_EVENT.customElementDelete,
  FARHA_NATIVE_ELEMENT_SELECT: STUDIO_BRIDGE_EVENT.nativeElementSelect,
  FARHA_EDIT_FIELD: STUDIO_BRIDGE_EVENT.editField,
};

export function createStudioBridgeMessage({ source, event, payload = {} }) {
  return {
    type: STUDIO_BRIDGE_MESSAGE_TYPE,
    version: STUDIO_BRIDGE_VERSION,
    source,
    event,
    payload,
  };
}

export function parseStudioBridgeMessage(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (data.type === STUDIO_BRIDGE_MESSAGE_TYPE) {
    return {
      source: data.source || '',
      event: data.event || '',
      payload: data.payload || {},
      isLegacy: false,
      raw: data,
    };
  }

  const event = LEGACY_EVENT_BY_TYPE[data.type];
  if (!event) {
    return null;
  }

  return {
    source: 'legacy',
    event,
    payload: data.payload || (event === STUDIO_BRIDGE_EVENT.editField ? { fieldKey: data.fieldKey } : {}),
    isLegacy: true,
    raw: data,
  };
}
