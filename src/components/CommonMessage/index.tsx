import { message } from 'antd';
import i18n from 'i18next';

class CommonMessage {
  error(text: any) {
    if (
      /((You closed the prompt with out any action)|(Operation canceled)|(You closed the prompt without any action))/.test(
        JSON.stringify(text),
      )
    ) {
      const txt = i18n.t('Request rejected. eBridge needs your permission to continue');
      return message.error(txt);
    }
    message.error(text);
  }
}
// eslint-disable-next-line import/no-anonymous-default-export
export default new CommonMessage();
