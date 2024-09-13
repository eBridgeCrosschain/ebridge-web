import { memo } from 'react';
import { Row, Col } from 'antd';

import styles from './styles.module.less';

function PrivacyPolicy() {
  return (
    <div className={styles['privacy-policy']}>
      <div className={styles['title']}>Privacy Policy</div>
      <div className={styles['sub-title']}>Last updated: August 2024</div>
      <Row gutter={[0, 16]} className={styles['content']}>
        <Col>
          <Row gutter={[0, 8]}>
            <Col>
              {`This privacy policy ("`}
              <span className="font-family-medium">{`Privacy Policy`}</span>
              {`") elucidates the procedures by which the eBridge Team ("eBridge", "our", "we", or "us") gathers, employs, and divulges information about you. It is applicable when you use or access `}
              <a target="_blank" href="https://ebridge.exchange/" rel="noreferrer">
                https://ebridge.exchange/
              </a>
              {` and/or `}
              <a target="_blank" href="https://test.ebridge.exchange/" rel="noreferrer">
                https://test.ebridge.exchange/
              </a>
              {` (the "`}
              <span className="font-family-medium">{`Site`}</span>
              {`"), interact with our customer service team, engage with us on social media platforms, or otherwise communicate with us.`}
            </Col>
            <Col>
              {`We reserve the right to modify this Privacy Policy periodically. Should alterations occur, we will notify you by amending the date at the top of this Privacy Policy. Additionally, in certain instances, we may provide further notification, such as appending a statement to our Site or dispatching a notification to you. We encourage you to regularly review this Privacy Policy to remain informed about our information procedures and the choices at your disposal.`}
            </Col>
            <Col>
              {`Your use of the Site is at all times subject to the Terms of Service, which incorporates this Privacy Policy.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>1. Acceptance of the Privacy Policy</Col>
            <Col>
              {`By accessing and using the Site, you acknowledge and agree to the terms outlined in this Privacy Policy. Where required by applicable law, your explicit consent will be sought for the collection and use of your personal information as detailed herein.`}
            </Col>
            <Col>
              {`From time to time, additional "just-in-time" disclosures or specific information regarding the data processing practices of particular services may be provided. These disclosures are intended to supplement or clarify the privacy practices described in this Privacy Policy and may offer you additional choices regarding how your personal data is processed.`}
            </Col>
            <Col>
              {`If you do not agree with any part of this Privacy Policy or any of its terms herein, you should immediately cease accessing and using the Site. Access to the Site is restricted to individuals who are of legal age of majority in their jurisdiction of residence.`}
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
            <Col className={styles['h1-title']}>3. Collection of Information</Col>
            <Col className={styles['h1-title']}>{`(a) Non-Collection of Personal Information`}</Col>
            <Col>
              {`eBridge does not collect personal information or utilize automatic tracking technologies. The eBridge application operates using blockchain technologies that access only publicly available information on the blockchain. Users are not required to provide any personal information to access or use the Site. However, please note that transactions conducted from your wallets are publicly accessible on blockchain networks accessed through the Site.`}
            </Col>
            <Col className={styles['h1-title']}>{`(b) IP Address Handling`}</Col>
            <Col>
              {`eBridge does not track or collect IP addresses. In instances where third parties may collect IP addresses by default, eBridge shall: (1) request the manual removal of IP tracking, and (2) ensure the anonymization of IP data to prevent product analytics services from receiving identifiable IP data.`}
            </Col>
            <Col className={styles['h1-title']}>{`(c) Google Analytics Usage`}</Col>
            <Col>
              {`eBridge uses Google Analytics solely for purposes of monitoring action on the Site. All IP addresses processed through Google Analytics are anonymized to protect user privacy.`}
            </Col>
            <Col className={styles['h1-title']}>{`(d) Data Storage and Usage`}</Col>
            <Col>
              {`eBridge does not store personal or message information and does not use information in any way that could associate or cross-associate wallet data.`}
            </Col>
            <Col className={styles['h1-title']}>{`(e) Do Not Track Signals`}</Col>
            <Col>
              {`Some Internet browsers allow users to transmit "Do Not Track" or "DNT" signals. As uniform standards for "DNT" signals have not been adopted, the Site does not currently process or respond to "DNT" signals.`}
            </Col>
            <Col className={styles['h1-title']}>{`(f) Security of Private Keys`}</Col>
            <Col>
              {`eBridge will never collect your seed phrase or private keys nor ask you to share your wallet private keys or seed phrase. Always exercise caution and never trust any entity or site that requests you to enter your private keys or similar security information.`}
            </Col>
            <Col className={styles['h1-title']}>{`(g) Use of Blockchain Information`}</Col>
            <Col>
              {`eBridge may collect publicly available blockchain information relevant to your transactions for the purpose of utilizing such information in, or providing such information to third-parties building or maintaining, analytics pages and block explorers. Such information will always be anonymous and never tied to any personal information, and will only be maintained for as long as necessary for the stated purpose.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>4. Sharing of Personal Information</Col>
            <Col>
              {`We may from time to time disclose personal information under the following circumstances or as otherwise outlined in this Privacy Policy.`}
            </Col>
            <Col className={styles['list-item']}>
              {`Personal information is shared with vendors, service providers, and consultants who require access to such information to perform services for us. This includes entities assisting with web hosting, event organising, payment processing, fraud prevention, customer service, and marketing and advertising.`}
            </Col>
            <Col className={styles['list-item']}>
              {`Personal information may be disclosed if we believe such action is consistent with, or required by, any applicable law or legal process, including lawful requests by public authorities to meet national security or law enforcement requirements.`}
            </Col>
            <Col className={styles['list-item']}>
              {`We may share personal information if we believe your actions are inconsistent with our user agreements or policies, if we suspect you have violated the law, or if we deem it necessary to protect the rights, property, and safety of eBridge, our users, the public, or others.`}
            </Col>
            <Col className={styles['list-item']}>
              {`Personal information is shared with our legal and professional advisors as needed to obtain advice or to safeguard and manage our business interests.`}
            </Col>
            <Col className={styles['list-item']}>
              {`Personal information may be shared in connection with, or during negotiations related to, any merger, sale of company assets, financing, or acquisition of all or part of our business by another company.`}
            </Col>
            <Col className={styles['list-item']}>
              {`Personal information is shared with your consent or at your direction.`}
            </Col>
            <Col>
              {`Additionally, we share aggregated or de-identified information that cannot reasonably identify you.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>5. Security of your Personal Information</Col>
            <Col>
              {`The security of your personal information is a shared responsibility. While we implement reasonable measures to protect your data, unauthorized access, hardware or software failures, and other unforeseen events may compromise the security of your information. Your wallet is safeguarded by your password, private key, and/or seed phrase. We strongly recommend that you maintain the confidentiality of these credentials and avoid leaving your wallet accessible in an unsecured manner.`}
            </Col>
            <Col>
              {`Our approach to protecting personal information includes minimizing the collection of personal data wherever possible. However, please be aware that no security measures are foolproof. Despite our efforts, we cannot guarantee that your personal information will not be accessed, disclosed, altered, or destroyed as a result of a breach of our security protocols.`}
            </Col>
            <Col>
              {`By using the Site, you acknowledge and accept that there are inherent risks associated with the transmission and storage of personal information, and you agree to assume these risks.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>6. Transfer of Information to other Jurisdictions</Col>
            <Col>
              {`eBridge may operate and engage service providers in various jurisdictions. Therefore, we and our service providers may transfer your personal information to, or store or access it in, jurisdictions that may not provide levels of data protection that are equivalent to those of your home jurisdiction. By using our Site, you acknowledge and agree to such transfers and processing, including to and in the United States. We will take steps to ensure that your personal information receives an adequate level of protection in the jurisdictions in which we process it.`}
            </Col>
            <Col>
              {`If you are a resident of the European Economic Area ("EEA") or Switzerland, you may be entitled to additional rights concerning your Personal Data under the General Data Protection Regulation ("GDPR") and other applicable laws, as described below.`}
            </Col>
            <Col>
              {`For the purposes of this section, the terms "Personal Data" and "processing" are used as defined under the GDPR. "Personal Data" generally refers to any information that can be used to identify an individual, while "processing" encompasses a wide range of actions related to data, including but not limited to collection, use, storage, and disclosure.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>7. Use of Social and Developer Networks</Col>
            <Col>
              {`We may utilize social and developer networks, such as Twitter and Telegram, to engage with our community, provide updates, and respond to user inquiries. Please be aware that when you interact with us on these platforms, the operators of the respective networks may collect and process your personal data in accordance with their own privacy policies. The responsibility for this processing lies with the respective social and developer networks, and we encourage you to review their privacy policies to understand how your data may be handled. eBridge is not responsible for the collection or processing of data by these networks.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>8. Changes to Privacy Policy</Col>
            <Col>
              {`If we change our Privacy Policy, we will post those changes on the Site so that users are always aware of what information we collect, how we use it, and under what circumstances, if any, we will disclose it. These changes will be effective immediately. In any event, changes to this Privacy Policy may affect our use of Personal Information that you provided us prior to our notification to you of the changes. Please check this Privacy Policy periodically to inform yourself of any changes. If you do not accept the changes made to this Privacy Policy, you should immediately stop using the Site and our products and services.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>9. Contact Us</Col>
            <Col>
              {`If you have any questions about this Privacy Policy, please contact us at `}
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

export default memo(PrivacyPolicy);
