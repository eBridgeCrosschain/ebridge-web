import { memo } from 'react';
import { Row, Col } from 'antd';

import styles from './styles.module.less';

function TeamOfService() {
  return (
    <div className={styles['team-of-service']}>
      <div className={styles['title']}>Terms of Service</div>
      <div className={styles['sub-title']}>Last updated: October, 2023</div>
      <Row gutter={[0, 16]} className={styles['content']}>
        <Col>
          <Row gutter={[0, 8]}>
            <Col>
              {`This website-hosted interface (the "Site") is provided by eBridge Team ("eBridge ", "we", "our", or "us"). The Site provides users with an informational interface relating to a decentralized protocol on the eBridge application that allows users to bridge, stake, and pool certain digital assets  (the "Protocol"), subject to the latest features and functions published on the site. The Site is one, but not the exclusive, means of constructing data inputs for purposes of accessing the Protocol. These Terms of Use ("Terms") explain the terms and conditions by which you may access and use the Site. By accessing or using the Site, you signify that you have read, understand, and agree to be bound by these Terms in their entirety. If you do not agree, you are not authorized to access or use the Site and should not use the Site.`}
            </Col>
            <Col className="font-family-medium">
              {`PLEASE NOTE: THE "DISPUTE RESOLUTION" SECTION OF THESE TERMS CONTAINS AN ARBITRATION CLAUSE THAT REQUIRES DISPUTES TO BE ARBITRATED ON AN INDIVIDUAL BASIS, AND PROHIBITS CLASS ACTION CLAIMS. IT AFFECTS HOW DISPUTES BETWEEN YOU AND THE eBridge ARE RESOLVED. BY ACCEPTING THESE TERMS, YOU AGREE TO BE BOUND BY THIS ARBITRATION PROVISION. PLEASE READ IT CAREFULLY.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>1. Modification of these Terms</Col>
            <Col>
              {`eBridge reserves the right, in its sole discretion, to modify these Terms from time to time. If any modifications are made, we will be notified by an update to the date at the top of the Terms. A current version of the Terms is maintained at `}
              <a target="_blank" href="https://ebridge.exchange/" rel="noreferrer">
                https://ebridge.exchange/
              </a>
              {` and `}
              <a target="_blank" href="https://test.ebridge.exchange/" rel="noreferrer">
                https://test.ebridge.exchange/
              </a>
              {`. All modifications will be effective when they are posted, and your continued accessing of the Site will serve as confirmation of your acceptance of those modifications. If you do not agree with any modifications to these Terms, you must immediately stop accessing the Site.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>2. Eligibility</Col>
            <Col>
              {`To access or use the Site, you must be able to form a legally binding contract with us. Accordingly, you represent that you are at least the age of majority in your jurisdiction and have the full right, power, and authority to enter into and comply with the terms and conditions of these Terms on behalf of yourself and any company or legal entity for which you may access or use the Site.`}
            </Col>
            <Col>
              {`You represent that your access and use of the Site will fully comply with all applicable laws and regulations, and that you will not access or use the Site to conduct, promote, or otherwise facilitate any illegal activity.`}
            </Col>
            <Col>
              {`While the Site does not custody or hold any assets of users, rendering eBridge incapable of “blocking” any interests in property, to the extent (in our sole and absolute discretion) you breach your representations and/or obligations under this section, eBridge reserves the right to notify any relevant identifiable persons of such breach to enable the blocking of interests in property as required under relevant rules and regulations.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>3. Proprietary Rights</Col>
            <Col>
              {`eBridge and its related entities own all intellectual property and other rights in the Site and its contents, including (but not limited to) software, text, images, trademarks, service marks, copyrights, patents, and designs. The Protocol is comprised of source-available software running on public distributed blockchains.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>4. Additional Rights</Col>
            <Col>
              {`eBridge reserves the following rights: (a) with or without notice to you, to modify, substitute, eliminate or add to the Site; (b) to review, modify, filter, disable, delete and remove any and all content and information from the Site; and (c) to cooperate with any law enforcement, court or government investigation or order or third party requesting or directing that we disclose information or content or information that you provide.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>5. Privacy</Col>
            <Col>
              {`When you use the Site, the only information we collect from you is your blockchain wallet address and your transaction send information. We do not collect any personal information from you (e.g., your name or other identifiers that can be linked to you). Please see the Privacy Policy for further information.`}
            </Col>
            <Col>
              {`When you utilize any data inputs provided by the Site to execute transactions, you are interacting with public blockchains, which provide transparency into your transactions. eBridge does not control and is not responsible for any information you make public on any public blockchain by taking actions utilizing data provided by the Site.`}
            </Col>
            <Col>
              {`eBridge may share the information collected with blockchain analytics providers to promote the safety, security, and integrity of the Site. eBridge does not retain any information collected any longer than necessary for this purpose.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>6. Prohibited Activity</Col>
            <Col>
              {`You agree not to engage in, or attempt to engage in, any of the following categories of prohibited activity in relation to your access and use of the Site:`}
            </Col>
            <Col>
              {`Intellectual Property Infringement. Activity that infringes on or violates any copyright, trademark, service mark, patent, right of publicity, right of privacy, or other proprietary or intellectual property rights under the law.`}
            </Col>
            <Col>
              {`Cyberattack. Activity that seeks to interfere with or compromise the integrity, security, or proper functioning of any computer, server, network, personal device, or other information technology system, including (but not limited to) the deployment of viruses and denial of service attacks.`}
            </Col>
            <Col>
              {`Fraud and Misrepresentation. Activity that seeks to defraud us or any other person or entity, including (but not limited to) providing any false, inaccurate, or misleading information in order to unlawfully obtain the property of another, and impersonating any person or entity or otherwise misrepresenting your affiliation with a person or entity.`}
            </Col>
            <Col>
              {`Circumventing Security/Compliance Measures. The use of any means, including masking your IP address or using a proxy IP address or virtual private network, to bypass or circumvent any security and/or compliance measures taken by eBridge with respect to Site access.`}
            </Col>
            <Col>
              {`Violation of Law. Violate any applicable federal, state, local, national, or international law, or any regulations having the force of law, including any laws or regulations concerning the integrity of trading markets (e.g., manipulative tactics commonly known as spoofing and wash trading) or trading of securities or derivatives and furthering or promoting any criminal activity or enterprise or providing instructional information about illegal activities.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>7. Not Registered with FinCEN or any agency</Col>
            <Col>
              {`eBridge is not registered with the Financial Crimes Enforcement Network as a money services business or in any other capacity, or with any other regulatory body in any capacity. You understand and acknowledge that we do not broker trading orders on your behalf, match orders for buyers and sellers of securities. We also do not facilitate the execution or settlement of your transactions, which occur entirely on public distributed blockchains. The Site is strictly a means by which users may construct transaction data to be utilized by the individual user by executing transactions utilizing third-party blockchain wallet applications.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>8. Non-Solicitation; No Investment Advice; No Fiduciary Duties</Col>
            <Col>
              {`You agree and understand that all transfers, pools, staking or other actions you perform utilizing transaction data provided by the Site are considered unsolicited, which means that you have not received any investment advice from us in connection with any such action, and that we do not conduct a suitability review of any such action.`}
            </Col>
            <Col>
              {`All information provided by the Site is for informational purposes only and should not be construed as investment advice. You should not take, or refrain from taking, any action based on any information contained in the Site. We do not make any investment recommendations to you or opine on the merits of any investment transaction or opportunity. You alone are responsible for determining whether any investment, investment strategy or related transaction is appropriate for you based on your personal investment objectives, financial circumstances, and risk tolerance.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>9. No Warranties</Col>
            <Col className="font-family-medium">
              {`THE SITE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, eBridge WILL NOT BE LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM THE USE OF THE SITE, INCLUDING, BUT NOT LIMITED TO INDIRECT, INCIDENTAL, PUNITIVE, EXEMPLARY, SPECIAL OR CONSEQUENTIAL DAMAGES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOU AGREE THAT YOUR USE OF THE SITE WILL BE AT YOUR SOLE RISK. eBridge IS NOT RESPONSIBLE FOR ANY DAMAGES OR LOSSES THAT RESULT FROM YOUR USE OF THE SITE, INCLUDING, BUT NOT LIMITED TO, YOUR USE OR INABILITY TO USE THE SITE; ANY CHANGES TO OR INACCESSIBILITY OR TERMINATION OF THE SITE; ANY DELAY, FAILURE, UNAUTHORIZED ACCESS TO, OR ALTERATION OF ANY TRANSMISSION OR DATA; ANY TRANSACTION OR AGREEMENT ENTERED INTO THROUGH THE SITE; ANY ACTIVITIES OR COMMUNICATIONS OF THIRD PARTIES; OR ANY DATA OR MATERIAL FROM A THIRD PERSON ACCESSED ON OR THROUGH THE SITE. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE'S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE SITE.`}
            </Col>
            <Col className="font-family-medium">
              {`eBridge ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SITE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SITE BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITE. IF YOU ARE DISSATISFIED WITH THE SITE, YOU AGREE THAT YOUR SOLE AND EXCLUSIVE REMEDY SHALL BE FOR YOU TO DISCONTINUE YOUR USE OF THE SITE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION AND EXCLUSIONS MAY NOT APPLY TO YOU.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>10. Non-Custodial and No Fiduciary Duties</Col>
            <Col>
              {`The Site is a purely non-custodial interface, meaning you are solely responsible for the custody of the cryptographic private keys to the digital asset wallets you hold. These Terms is not intended to, and does not, create or impose any fiduciary duties on us. To the fullest extent permitted by law, you acknowledge and agree that we owe no fiduciary duties or liabilities to you or any other party, and that to the extent any such duties or liabilities may exist at law or in equity, those duties and liabilities are hereby irrevocably disclaimed, waived, and eliminated. You further agree that the only duties and obligations that we owe you are those set out expressly in these Terms.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>11. Compliance Obligations</Col>
            <Col>
              {`By accessing or using the Site, you agree that you are solely and entirely responsible for compliance with all laws and regulations that may apply to you.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>12. Assumption of Risk</Col>
            <Col>
              {`By accessing and using the Site, you represent that you are financially and technically sophisticated enough to understand the inherent risks associated with using cryptographic and blockchain-based systems, and that you have a working knowledge of the usage and intricacies of digital assets. You understand that blockchain-based transactions are irreversible.`}
            </Col>
            <Col>
              {`You further understand that the markets for these digital assets are highly volatile due to factors including (but not limited to) adoption, speculation, technology, security, and regulation. You acknowledge and accept that the cost and speed of transacting with cryptographic and blockchain-based systems are variable and may increase dramatically at any time. You further acknowledge and accept the risk that your digital assets may lose some or all of their value while they are supplied to the Protocol through the Site, you may suffer loss due to the fluctuation of prices of tokens in a trading pair or liquidity pool, and, especially in expert modes, experience significant price slippage and cost. You understand that anyone can create a token, including fake versions of existing tokens and tokens that falsely claim to represent projects, and acknowledge and accept the risk that you may mistakenly trade those or other tokens. You further acknowledge that we are not responsible for any of these variables or risks, do not own or control the Protocol, and cannot be held liable for any resulting losses that you experience while accessing or using the Site. Accordingly, you understand and agree to assume full responsibility for all of the risks of accessing and using the Site for the purpose of interacting with the Protocol.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>13. Third-Party Resources and Promotions</Col>
            <Col>
              {`The Site may contain references or links to third-party resources, including (but not limited to) information, materials, products, or services, that we do not own or control. In addition, third parties may offer promotions related to your access and use of the Site. We do not endorse or assume any responsibility for any such resources or promotions. If you access any such resources or participate in any such promotions, you do so at your own risk, and you understand that these Terms does not apply to your dealings or relationships with any third parties. You expressly relieve us of any and all liability arising from your use of any such resources or participation in any such promotions.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>14. Release of Claims</Col>
            <Col>
              {`You expressly agree that you assume all risks in connection with your access and use of the Site and your interaction with the Protocol. You further expressly waive and release us from any and all liability, claims, causes of action, or damages arising from or in any way relating to your use of the Site and your interaction with the Protocol. If you are a California resident, you waive the benefits and protections of California Civil Code § 1542, which provides: "[a] general release does not extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release and that, if known by him or her, would have materially affected his or her settlement with the debtor or released party."`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>15. Indemnity</Col>
            <Col>
              {`You agree to hold harmless, release, defend, and indemnify us and our officers, directors, employees, contractors, agents, affiliates, and subsidiaries from and against all claims, damages, obligations, losses, liabilities, costs, and expenses arising from: (a) your access and use of the Site; (b) your violation of any term or condition of these Terms, the right of any third party, or any other applicable law, rule, or regulation; and (c) any other party's access and use of the Site with your assistance or using any device or account that you own or control.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>16. Limitation of Liability</Col>
            <Col>
              {`Under no circumstances shall we or any of our officers, directors, employees, contractors, agents, affiliates, or subsidiaries be liable to you for any indirect, punitive, incidental, special, consequential, or exemplary damages, including (but not limited to) damages for loss of profits, goodwill, use, data, or other intangible property, arising out of or relating to any access or use of the Site, nor will we be responsible for any damage, loss, or injury resulting from hacking, tampering, or other unauthorized access or use of the Site or the information contained within it. We assume no liability or responsibility for any: (a) errors, mistakes, or inaccuracies of content; (b) personal injury or property damage, of any nature whatsoever, resulting from any access or use of the Site; (c) unauthorized access or use of any secure server or database in our control, or the use of any information or data stored therein; (d) interruption or cessation of function related to the Site; (e) bugs, viruses, trojan horses, or the like that may be transmitted to or through the Site; (f) errors or omissions in, or loss or damage incurred as a result of the use of, any content made available through the Site; and (g) the defamatory, offensive, or illegal conduct of any third party. Under no circumstances shall we or any of our officers, directors, employees, contractors, agents, affiliates, or subsidiaries be liable to you for any claims, proceedings, liabilities, obligations, damages, losses, or costs in an amount exceeding the amount you paid to us in exchange for access to and use of the Site, or USD$50.00, whichever is greater. This limitation of liability applies regardless of whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, and even if we have been advised of the possibility of such liability. Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of certain liabilities and damages. Accordingly, some of the disclaimers and limitations set forth in these Terms may not apply to you. This limitation of liability shall apply to the fullest extent permitted by law.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>17. Governing Law and Dispute Resolution</Col>
            <Col>
              {`You agree that the of the British Virgin Islands, without regard to principles of conflict of laws, govern these Terms and any Dispute between you and us.`}
            </Col>
            <Col>
              {`eBridge will use our best efforts to resolve any potential disputes through informal, good faith negotiations. If a potential dispute arises, you must contact us by sending an email to notices `}
              <a target="_blank" href="mailto:contact@ebridge.exchange" rel="noreferrer">
                contact@ebridge.exchange
              </a>
              {` so that we can attempt to resolve it without resorting to formal dispute resolution. If we aren't able to reach an informal resolution within sixty days of your email, then you and we both agree to resolve the potential dispute according to the process set forth below.`}
            </Col>
            <Col>
              {`You further agree that any claim or controversy arising out of or relating to the Site, these Terms, or any other acts or omissions for which you may contend that we are liable, including (but not limited to) any claim or controversy as to arbitrability ("Dispute"), shall be finally and exclusively submitted to the jurisdiction of the courts of the British Virgin Islands for the resolution.`}
            </Col>
            <Col>
              {`For the avoidance of doubt, you agree you are solely responsible for all interactions with any other user in connection with the Services, and eBridge will have no liability or responsibility with respect thereto. eBridge reserves the right, but has no obligation, to become involved in any way in disputes between you and any other user of the Site.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>18. Class Action and Jury Trial Waiver</Col>
            <Col>
              {`You must bring any and all disputes against us in your individual capacity and not as a plaintiff in or member of any purported class action, collective action, private attorney general action, or other representative proceeding. This provision applies to class arbitration. You and eBridge both agree to waive the right to demand a trial by jury.`}
            </Col>
          </Row>
        </Col>
        <Col>
          <Row gutter={[0, 8]}>
            <Col className={styles['h1-title']}>19. Entire Agreement</Col>
            <Col>
              {`These Terms and the Privacy Policy constitute the entire agreement between you and us with respect to the subject matter hereof. These Terms supersedes any and all prior or contemporaneous written and oral agreements, communications and other understandings (if any) relating to the subject matter of the terms. The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Site from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.`}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default memo(TeamOfService);
