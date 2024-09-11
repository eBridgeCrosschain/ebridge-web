import { memo } from 'react';
import { Row, Col } from 'antd';

import styles from './styles.module.less';

function TermsOfService() {
  return (
    <div className={styles['terms-of-service']}>
      <div className={styles['title']}>Terms of Service</div>
      <div className={styles['sub-title']}>Last updated: September 2024</div>
      <Row gutter={[0, 16]} className={styles['content']}>
        <Col>
          <Row gutter={[0, 8]}>
            <Col>
              {`Please read these terms and conditions that follow ("Terms") carefully as they form a contract between you and the eBridge Team ("eBridge ", "we", "our", or "us"). These Terms govern your access and use of the website-hosted interface provided by eBridge (`}
              <a target="_blank" href="https://ebridge.exchange/" rel="noreferrer">
                https://ebridge.exchange/
              </a>
              {`, the "Site").The Site provides users with an informational interface relating to a decentralized protocol on the eBridge application that allows users to bridge, stake, and pool certain digital assets (the "Protocol"), subject to the latest features and functions published on the site. The Site is one, but not the exclusive, means of constructing data inputs for purposes of accessing the Protocol.`}
            </Col>
            <Col>
              {`Please note that by accessing, browsing or otherwise using the Site, or by acknowledging agreement to the Terms and the eBridge Privacy Policy (`}
              <a target="_blank" href="https://ebridge.exchange/privacy-policy" rel="noreferrer">
                https://ebridge.exchange/privacy-policy
              </a>
              {`, you are accepting and agreeing to these Terms and the policies and guidelines referenced in these Terms. If you do not agree to these Terms, you are not authorized to access or use the Site and should not use the Site.`}
            </Col>
            <Col className="font-family-medium">{`PLEASE NOTE: THE "GOVERNING LAW AND DISPUTE RESOLUTION" SECTION OF THESE TERMS CONTAINS AN ARBITRATION CLAUSE THAT REQUIRES DISPUTES TO BE ARBITRATED ON AN INDIVIDUAL BASIS, AND PROHIBITS CLASS ACTION CLAIMS. IT AFFECTS HOW DISPUTES BETWEEN YOU AND THE eBridge ARE RESOLVED. BY ACCEPTING THESE TERMS, YOU AGREE TO BE BOUND BY THIS ARBITRATION PROVISION. PLEASE READ IT CAREFULLY.`}</Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>1. Modification of these Terms</Col>
            <Col>
              {`eBridge reserves the right, in its sole discretion, to modify these Terms from time to time. If any modifications are made, we will notify you of amendments to these Terms by either: (a) posting the revised terms on our Site; (b) sending you an email notification to the email address that you provided to us as part of your account registration, or a notification via SMS or other messaging service; or (c) presenting the revised Terms to you when you access the Site. It is your responsibility to provide and update your external email address, check for such notices, and make sure our notices have not been trapped by your spam filter. It is your responsibility to periodically revisit these Terms as posted on our Site. Such updated Terms will become effective the earlier of: (a) when you accept it online or offline, (b) after we post or email the update, in which case your continued use of the Site will indicate your acceptance of the amendment.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>2. Eligibility</Col>
            <Col>
              {`To access or use the Site, you must be legally capable of entering into a binding contract with us. By using the Site, you represent and warrant that you are at least the age of majority in your jurisdiction and possess the full legal right, authority, and capacity to enter into and abide by the terms and conditions of these Terms of Use on behalf of yourself and any entity you represent.`}
            </Col>
            <Col>
              {`You further represent and warrant that your access to and use of the Site will be in full compliance with all applicable laws, regulations, and standards, and that you will not use the Site to conduct, promote, or facilitate any unlawful activities.`}
            </Col>
            <Col>
              {`While the Site does not hold or manage any user assets, and therefore cannot "block" any interests in property, eBridge reserves the right, at its sole and absolute discretion, to notify relevant authorities or identifiable parties in the event of any breach of these representations and/or obligations, to enable the blocking or freezing of interests in property as required under applicable laws and regulations.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>3. Proprietary Rights</Col>
            <Col>
              {`All intellectual property rights and proprietary interests in and to the Site, including but not limited to the software, text, images, trademarks, service marks, copyrights, patents, and designs, are owned by eBridge and its affiliated entities. The Protocol is composed of source-available software running on public distributed blockchains. Your use of the Site does not grant you any rights, title, or interest in or to any intellectual property or proprietary rights contained on the Site, except for the limited rights of use expressly granted under these Terms.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>4. Additional Rights</Col>
            <Col>
              {`eBridge reserves the following rights, which may be exercised at its sole discretion, with or without notice to you: (a) To modify, substitute, eliminate, or add to the Site or any part thereof; (b) To review, modify, filter, disable, delete, and remove any content or information submitted or uploaded to the Site by you or any other user; (c) To cooperate with any law enforcement, judicial, or governmental investigation, order, or third-party request, including disclosing any information or content provided by you, as required by applicable law or as we, in our sole discretion, deem necessary or appropriate.`}
            </Col>
            <Col>
              {`By accessing and using the Site, you acknowledge and agree that eBridge shall not be liable for any modification, suspension, or discontinuance of the Site or any part thereof, nor for the removal of any content or information you provide.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>5. Privacy</Col>
            <Col>
              {`When you access or use the Site, the only information we collect from you is your blockchain wallet address and your transaction data. We do not collect any personally identifiable information, such as your name or other identifiers that can be directly linked to you. For further details on our data practices, please refer to our Privacy Policy.`}
            </Col>
            <Col>
              {`When you utilize any data inputs provided by the Site to execute transactions, you are interacting with public blockchains, which inherently provide transparency into your transactions. eBridge does not control, and is not responsible for, any information you choose to make public on any blockchain by engaging in activities using the data provided by the Site.`}
            </Col>
            <Col>
              {`To promote the safety, security, and integrity of the Site, eBridge may share the information it collects with blockchain analytics providers. Such information will only be retained for as long as necessary to fulfill these purposes and will be handled in accordance with our Privacy Policy.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>6. Prohibited Activity</Col>
            <Col>
              {`By accessing and using the Site, you agree not to engage in, or attempt to engage in, any of the following prohibited activities:`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Intellectual Property Infringement: `}</span>
              {`Any activity that infringes upon or violates any copyright, trademark, service mark, patent, right of publicity, right of privacy, or other proprietary or intellectual property rights recognized under applicable law.`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Cyberattacks: `}</span>
              {`Any activity intended to interfere with or compromise the integrity, security, or proper functioning of any computer system, server, network, personal device, or other information technology systems, including but not limited to the deployment of viruses, malware, or denial-of-service attacks.`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Fraud and Misrepresentation: `}</span>
              {`Any activity designed to defraud eBridge or any other person or entity, including but not limited to providing false, inaccurate, or misleading information to unlawfully obtain the property of another, impersonating any person or entity, or misrepresenting your affiliation with any person or entity.`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Circumvention of Security/Compliance Measures: `}</span>
              {`The use of any techniques, including but not limited to IP address masking, proxy IP addresses, or virtual private networks, to bypass or circumvent any security or compliance measures implemented by eBridge with respect to Site access.`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Violation of Law: `}</span>
              {`Any activity that violates any applicable federal, state, local, national, or international law, or any regulations with the force of law, including but not limited to laws governing the integrity of trading markets (e.g., spoofing, wash trading) or the trading of securities or derivatives, and any activity that furthers or promotes criminal conduct or provides instructional information about illegal activities.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>7. Not Registered with FinCEN or Any Regulatory Agency</Col>
            <Col>
              {`eBridge is not registered with the Financial Crimes Enforcement Network ("FinCEN") as a money services business or in any other capacity, nor is it registered with any other regulatory body in any jurisdiction. You acknowledge and agree that eBridge does not broker trading orders on your behalf, match orders between buyers and sellers of securities or facilitate the execution or settlement of transactions. All transactions conducted through the Site occur entirely on public distributed blockchains. The Site serves solely as a platform for users to construct transaction data, which they may then utilize by executing utilizing third-party blockchain wallet applications.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>8. Non-Solicitation; No Investment Advice; No Fiduciary Duties</Col>
            <Col>
              {`You acknowledge and agree that all transfers, pooling, staking or other actions you undertake using transaction data provided by the Site are conducted on an unsolicited basis. This means that you have not received any investment advice or recommendations from us in connection with any such actions, and we do not conduct any suitability review regarding your use of the Site.`}
            </Col>
            <Col>
              {`All information provided by the Site is for informational purposes only and should not be construed as investment advice. You should not take or refrain from taking any action based on the information available on the Site. We do not provide investment recommendations, nor do we express opinions on the merits of any specific investment transaction or opportunity. You are solely responsible for determining whether any investment, investment strategy, or related transaction is suitable for you, based on your personal investment objectives, financial circumstances, and risk tolerance.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>9. No Warranties</Col>
            <Col className="font-family-medium">
              {`THE SITE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, eBridge DISCLAIMS ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. eBridge WILL NOT BE LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM YOUR USE OF THE SITE, INCLUDING BUT NOT LIMITED TO ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, EXEMPLARY, SPECIAL, OR CONSEQUENTIAL DAMAGES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOU AGREE THAT YOUR USE OF THE SITE IS AT YOUR SOLE RISK.`}
            </Col>
            <Col className="font-family-medium">
              {`eBridge IS NOT RESPONSIBLE FOR ANY DAMAGES OR LOSSES THAT MAY ARISE FROM YOUR USE OF THE SITE, INCLUDING BUT NOT LIMITED TO DAMAGES OR LOSSES RESULTING FROM YOUR USE OR INABILITY TO USE THE SITE; ANY CHANGES TO OR TERMINATION OF THE SITE; ANY DELAY, FAILURE, UNAUTHORIZED ACCESS TO, OR ALTERATION OF ANY TRANSMISSION OR DATA; ANY TRANSACTION OR AGREEMENT ENTERED INTO THROUGH THE SITE; ANY ACTIVITIES OR COMMUNICATIONS OF THIRD PARTIES; OR ANY DATA OR MATERIAL ACCESSED THROUGH THE SITE. WE MAKE NO WARRANTIES OR REPRESENTATIONS REGARDING THE ACCURACY OR COMPLETENESS OF THE SITE'S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE SITE.`}
            </Col>
            <Col className="font-family-medium">
              {`eBridge ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY OF THE FOLLOWING: (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS; (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY KIND, RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE; (3) UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY PERSONAL OR FINANCIAL INFORMATION STORED THEREIN; (4) INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SITE; (5) BUGS, VIRUSES, TROJAN HORSES, OR OTHER MALICIOUS CODE TRANSMITTED THROUGH THE SITE BY ANY THIRD PARTY; OR (6) ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS, OR FOR ANY LOSS OR DAMAGE INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITE. IF YOU ARE DISSATISFIED WITH THE SITE, YOUR SOLE AND EXCLUSIVE REMEDY IS TO DISCONTINUE USE OF THE SITE. CERTAIN JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS AND EXCLUSIONS MAY NOT APPLY TO YOU.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>10. Non-Custodial and No Fiduciary Duties</Col>
            <Col>
              {`The Site functions as a purely non-custodial interface, meaning you retain sole responsibility for the custody and security of the cryptographic private keys associated with your digital asset wallets. These Terms are not intended to, and do not, create or impose any fiduciary duties on us. To the fullest extent permitted by law, you acknowledge and agree that we owe no fiduciary duties or liabilities to you or any other party. Any such duties or liabilities that may exist under law or in equity are hereby irrevocably disclaimed, waived, and eliminated. You further agree that our only duties and obligations to you are those expressly set forth in these Terms.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>11. Compliance Obligations</Col>
            <Col>
              {`By accessing or using the Site, you agree that you are solely and entirely responsible for compliance with all applicable laws and regulations.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>12. Assumption of Risk</Col>
            <Col>
              {`By accessing and using the Site, you represent that you possess the necessary financial and technical expertise to understand the inherent risks associated with cryptographic and blockchain-based systems. You acknowledge that blockchain-based transactions are irreversible.`}
            </Col>
            <Col>
              {`You further acknowledge that digital asset markets are highly volatile, influenced by factors such as adoption, speculation, technology, security, and regulation. You accept that the cost and speed of transactions using blockchain-based systems can fluctuate and may increase significantly at any time. You also acknowledge the risk that your digital assets may lose some or all of their value when interacting with the Protocol through the Site, that you may experience losses due to price fluctuations in trading pairs or liquidity pools, and that in advanced modes, you may encounter significant price slippage and costs. You understand that anyone can create tokens, including fraudulent versions of existing tokens and tokens that falsely claim to represent projects, and you accept the risk of inadvertently trading such tokens. You acknowledge that we do not own or control the Protocol and cannot be held liable for any losses you may incur while using the Site. Accordingly, you assume full responsibility for all risks associated with accessing and using the Site.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>13. Third-Party Resources and Promotions</Col>
            <Col>
              {`The Site may include references or links to third-party resources, including but not limited to information, materials, products, or services that we do not own or control. Additionally, third parties may offer promotions related to your access and use of the Site. We do not endorse or assume any responsibility for any such third-party resources or promotions. If you choose to access or use such resources or participate in promotions, you do so at your own risk, and these Terms do not apply to your dealings with third parties. You expressly release us from any liability arising from your use of any such resources or participation in promotions.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>14. Release of Claims</Col>
            <Col>
              {`You expressly assume all risks in connection with your access and use of the Site and your interaction with the Protocol. You further expressly waive and release us from any and all liability, claims, causes of action, or damages arising from or in any way relating to your use of the Site and your interaction with the Protocol. If you are a California resident, you waive the benefits and protections of California Civil Code § 1542, which provides: "[a] general release does not extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release and that, if known by him or her, would have materially affected his or her settlement with the debtor or released party."`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>15. Indemnity</Col>
            <Col>
              {`You agree to indemnify, defend, and hold harmless eBridge, its officers, directors, employees, contractors, agents, affiliates, and subsidiaries from and against any claims, damages, obligations, losses, liabilities, costs, and expenses, including legal fees, arising from: (a) your access and use of the Site; (b) your violation of any term or condition of these Terms, any rights of a third party, or any applicable law, rule, or regulation; and (c) any third party's access and use of the Site with your assistance or through any device or account that you own or control.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>16. Limitation of Liability</Col>
            <Col>
              {`Under no circumstances shall eBridge or any of its officers, directors, employees, contractors, agents, affiliates, or subsidiaries be liable to you for any indirect, punitive, incidental, special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible property, arising out of or relating to your access or use of the Site, nor will we be liable for any damage, loss, or injury resulting from hacking, tampering, or other unauthorized access or use of the Site or its information. We assume no liability for any: (a) errors or inaccuracies of content; (b) personal injury or property damage resulting from your use of the Site; (c) unauthorized access to or use of any secure server or database in our control, or the use of any information stored therein; (d) interruption or cessation of Site functionality; (e) bugs, viruses, trojan horses, or similar malicious code transmitted through the Site; (f) errors or omissions in any content, or any loss or damage incurred as a result of the use of any content made available through the Site; or (g) defamatory, offensive, or illegal conduct of any third party. In no event shall our liability exceed the amount you paid to us in exchange for access to and use of the Site, or US$100.00, whichever is greater. This limitation of liability applies regardless of the legal basis of your claim, whether in contract, tort, negligence, strict liability, or otherwise, and even if we have been advised of the possibility of such liability. Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so some of the disclaimers and limitations in these Terms may not apply to you. This limitation of liability applies to the fullest extent permitted by law.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>17. Governing Law and Dispute Resolution</Col>
            <Col>
              <span className="font-family-medium">{`Governing Law: `}</span>
              {`These Terms, and any disputes arising out of or in connection to them, shall be governed by and construed in accordance with the laws of the British Virgin Islands, without regard to its conflict of law principles.`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Pre-Arbitration Procedures: `}</span>
              {`You and eBridge mutually agree to attempt to resolve all disputes using good-faith and strive for a prompt, low-cost, and mutually beneficial outcome. Therefore, a party who intends to seek arbitration must first send to the other party a written Notice of Dispute (a “`}
              <span className="font-family-medium">{`Dispute Notice`}</span>
              {`”). Any Dispute Notice to aelf must be sent to legal@aelf.io, and any Dispute Notice we send to you will be sent to the email address registered with your account or otherwise associated with your use of the Site and agreement to these Terms. Dispute Notices must include each of the following: (a) the contact details of the party providing the Dispute Notice; (b) a description of the nature and basis of the claim or dispute; (c) an explanation of the specific relief sought, including the total damages sought, if any, and the basis for the damage calculations; (d) a signed statement from the party providing the Dispute Notice verifying the accuracy of its contents; and (e) if the dispute is from you and you have retained an attorney, then a signed statement from you authorising aelf to disclose your account details to your attorney if necessary in resolving your claim or dispute. If an agreement is not reached to resolve a claim within 60 days after a notice of demand is received, then either party may commence an arbitration proceeding; except that, if either you or aelf send the other an incomplete Dispute Notice, the 60-day period begins tolling only after a complete Dispute Notice is received. Additionally, if either you or aelf request a telephone discussion, the 60-day period begins tolling only after the discussion has occurred. The statute of limitations and any filing fee deadlines will be tolled while the parties engage in required informal dispute resolution procedures.`}
            </Col>
            <Col>
              {`If we are unable to reach an amicable resolution within the 60-day period, you agree that any dispute, claim, or controversy arising out of or relating to the Site, these Terms, or any other acts or omissions for which you may hold us liable, including but not limited to disputes regarding arbitrability ("Dispute"), shall be  resolved by binding arbitration in accordance with the United Nation’s UNCITRAL Arbitration Rules (at `}
              <a
                target="_blank"
                href="https://uncitral.un.org/en/texts/arbitration/contractualtexts/arbitration"
                rel="noreferrer">
                https://uncitral.un.org/en/texts/arbitration/contractualtexts/arbitration
              </a>
              {`), which are incorporated into these Terms of Use by reference.`}
            </Col>
            <Col>
              <span className="font-family-medium">{`Arbitration Procedures: `}</span>
              {`Should any dispute proceed to arbitration, you and eBridge expressly agree that an arbitrator properly appointed under the UNCITRAL Arbitration Rules may issue all appropriate declaratory and injunctive relief necessary to ensure the arbitration and final settlement of disputes (but only in favour of the individual party seeking relief and only to the extent necessary to provide relief warranted by that party’s individual claim). You and aelf agree to keep any arbitration strictly confidential. The properly appointed arbitrator will have the authority to order any remedies, legal or equitable, that a party could obtain from a court of competent jurisdiction in an individual case based on the claims asserted, and nothing more.`}
            </Col>
            <Col>
              {`For clarity, you acknowledge that you are solely responsible for all interactions with other users in connection with the Services, and eBridge shall bear no liability or responsibility in this regard. eBridge reserves the right, but is not obligated, to intervene in disputes between you and any other user of the Site.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>18. Class Action and Jury Trial Waiver</Col>
            <Col>
              {`You agree to bring any and all disputes against us in your individual capacity, and not as a plaintiff or class member in any purported class action, collective action, private attorney general action, or other representative proceeding. This waiver applies to class arbitration as well. Both you and eBridge expressly waive any right to a trial by jury in any disputes.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>19. Entire Agreement</Col>
            <Col>
              {`These Terms, along with our Privacy Policy, constitute the entire agreement between you and us concerning your use of the Site and supersede all prior or contemporaneous communications, agreements, and understandings, whether written or oral, regarding the subject matter of these Terms.`}
            </Col>
            <Col>
              {`The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would violate any law or regulation or subject us to any registration requirement within such jurisdiction or country. By accessing the Site from any location outside of the British Virgin Islands, you do so at your own risk and are solely responsible for compliance with local laws and regulations, if and to the extent they are applicable.`}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default memo(TermsOfService);
