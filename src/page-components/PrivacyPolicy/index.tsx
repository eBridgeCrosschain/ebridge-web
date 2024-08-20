import { memo } from 'react';
import { Row, Col } from 'antd';

import styles from './styles.module.less';

function TeamOfService() {
  return (
    <div className={styles['privacy-policy']}>
      <div className={styles['title']}>Privacy Policy</div>
      <div className={styles['sub-title']}>Last updated: October, 2023</div>
      <Row gutter={[0, 16]} className={styles['content']}>
        <Col>
          <Row gutter={[0, 8]}>
            <Col>
              {`eBridge Team ("eBridge") is committed to protecting and respecting your privacy. This Privacy Policy describes how your personal or behavioral data is collected, used and stored when you access `}
              <a target="_blank" href="https://ebridge.exchange/" rel="noreferrer">
                https://ebridge.exchange/
              </a>
              {` and/or `}
              <a target="_blank" href="https://test.ebridge.exchange/" rel="noreferrer">
                https://test.ebridge.exchange/
              </a>
              {` (Collectively the "Site").`}
            </Col>
            <Col>
              {`This Privacy Policy may be modified from time to time which will be indicated by changing the date at the top of this page. Your use of the Site is at all times subject to the Terms of Service, which incorporates this Privacy Policy.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>1. Acceptance of the Privacy Policy</Col>
            <Col>
              {`By accessing the Site, you signify acceptance to the terms of this Privacy Policy. Where required by law, you will be asked for your consent to the collection and use of your information as described further below.`}
            </Col>
            <Col>
              {`Additional "just-in-time" disclosures or information about the data processing practices of specific services may be provided. These notices may supplement or clarify the privacy practices applicable to the Site or may provide you with additional choices about how your data is processed. If you do not agree with or you are not comfortable with any aspect of this Privacy Policy, you should immediately discontinue access or use of the Site. You may only access the Site if you are above the age of majority in your jurisdiction of residence.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>2. What does this Privacy Policy cover?</Col>
            <Col>
              {`This Privacy Policy sets forth our policy for collecting or using personal or behavioral data in connection with users access and using of the Site.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>3. The Information We Collect</Col>
            <Col>
              {`eBridge does not collect your personal information and does not use any automatic tracking technologies. The eBridge application leverages blockchain technologies that use only public information available on the blockchain. You are not required to provide any personal information to the Site. However, the transactions conducted from your wallets are publicly accessible on blockchain networks access through the Site.`}
            </Col>
            <Col>
              {`eBridge does not track IP addresses. Where third parties collect IP addresses by default: (1) manual removal of IP tracking is requested, and (2) IP data is anonymization to prevent product analytics services from receiving IP data.`}
            </Col>
            <Col>
              {`eBridge uses Google Analytics for purposes of monitoring action on the Site. All IP addresses are anonymized.`}
            </Col>
            <Col>
              {`eBridge does not store personal or message information or in any way use information to associate or cross-associate wallet data is not possible.`}
            </Col>
            <Col>
              {`Some Internet browsers include the ability to transmit "Do Not Track" or "DNT" signals. Since uniform standards for "DNT" signals have not been adopted, the Site does not currently process or respond to "DNT" signals.`}
            </Col>
            <Col>
              {`eBridge will never collect your seed phrase or private keys. We will never ask you to share your wallet private keys or seed phrase. Never trust anyone or any site that asks you to enter your private keys or similar security information.`}
            </Col>
            <Col>
              {`eBridge may collect publicly available blockchain information relevant to your transactions for the purpose of utilizing such information in, or providing such information to third-parties building or maintaining, analytics pages and block explorers. Such information will always be anonymous and never tied to any personal information, and will only be maintained for as long as necessary for the stated purpose.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>4. Sharing of the Personal Information</Col>
            <Col>
              {`We do not share or sell the personal information that you provide us with other organizations without your express consent, except as described in this Privacy Policy.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>5. How we Protect and Store Information</Col>
            <Col>
              {`The safety and security of your personal information also depends on you. Unauthorized entry or use, hardware or software failure, and other factors, may compromise the security of user information at any time. Your wallet is protected by your password, private key, and/or seed phrase, and we urge you to take steps to keep this and other Personal Information safe by not disclosing your security credentials or leaving your wallet open in an unsecured manner. We seek to protect personal information by refraining from collecting personal information where possible. However, these measures do not guarantee that your personal information will not be accessed, disclosed, altered or destroyed by breach of such firewalls and secure server software. By using the Site, you acknowledge that you understand and agree to assume these risks.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>6. International Transfers Of Personal Data</Col>
            <Col>
              {`If you are a resident of the European Economic Area ("EEA") or Switzerland, you may have additional rights under the General Data Protection Regulation (the "GDPR") and other applicable law with respect to your Personal Data, as outlined below.`}
            </Col>
            <Col>
              {`For this section, we use the terms "Personal Data" and "processing" as they are defined in the GDPR, but "Personal Data" generally means information that can be used to individually identify a person, and "processing" generally covers actions that can be performed in connection with data such as collection, use, storage and disclosure.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>7. Social Media</Col>
            <Col>
              {`We may use social and developer networks such as Twitter and Telegram. When you use them, the operators of the respective social and developer networks and may record that you are on such networks. This processing of your personal data lays in the responsibility of these networks and occurs according to their privacy policy. Please check with these individual social and developer networks regarding their privacy policies. eBridge is not responsible for data collected by these networks. We only use these platforms to inform our community of updates and answer user questions.`}
            </Col>
            <Col>
              {`f you have any questions about this page or our data practices generally, please contact notices `}
              <a target="_blank" href="mailto:info@ebridge.exchange" rel="noreferrer">
                info@ebridge.exchange
              </a>
              {`.`}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default memo(TeamOfService);
