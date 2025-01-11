import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Drawer } from 'antd';
import CommonMessage from 'components/CommonMessage';
import CommonModal from 'components/CommonModal';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';
import Remind, { RemindType } from 'components/Remind';
import CommonButton from 'components/CommonButton';
import ListingTip from '../../ListingTip';
import { useMobile } from 'contexts/useStore/hooks';
import { useWeb3 } from 'hooks/web3';
import { getApplicationIssue, prepareBindIssue } from 'utils/api/application';
import { getTransactionReceiptAutoRetry } from 'utils/wagmi';
import { getBridgeChainInfo, getChainIdByAPI } from 'utils/chain';
import { handleListingErrorMessage } from 'utils/error';
import { ApplicationChainStatusEnum, TApplicationChainStatusItem, TPrepareBindIssueRequest } from 'types/api';
import styles from './styles.module.less';
import { useCallEVMCreateOfficialToken } from 'hooks/token';
import useLockCallback from 'hooks/useLockCallback';
import { useLatestRef } from 'hooks';
import { DEFAULT_EVM_0_ADDRESS } from 'constants/evm';

export interface ICreationProgressModalProps {
  open: boolean;
  chains: TApplicationChainStatusItem[];
  supply: string;
  isFirstTimeCreation: boolean;
  isSelectAelfChains: boolean;
  handleCreateFinish: (params?: { errorChainIds?: string[] }) => void;
  handleClose: () => void;
}

type TTxHash = `0x${string}`;

type TChainItem = TApplicationChainStatusItem & {
  txHash?: TTxHash;
  isCreated?: boolean;
};

type TStepItem = ICommonStepsProps['stepItems'][number] & {
  chain: TChainItem;
};

const POLLING_INTERVAL = 15000;

export default function CreationProgressModal({
  open,
  chains,
  supply,
  isFirstTimeCreation,
  isSelectAelfChains,
  handleCreateFinish,
  handleClose,
}: ICreationProgressModalProps) {
  const { account: evmAccount } = useWeb3();
  const isMobile = useMobile();
  const callEVMCreateOfficialToken = useCallEVMCreateOfficialToken();
  const callEVMCreateOfficialTokenRef = useLatestRef(callEVMCreateOfficialToken);
  const poolingTimerForIssueResultRef = useRef<Record<string, NodeJS.Timeout | number>>({});
  const [isCreateStart, setIsCreateStart] = useState(false);
  const [isPollingStart, setIsPollingStart] = useState(false);
  const [stepItems, setStepItems] = useState<TStepItem[]>([]);

  const isWarning = useMemo(() => {
    return (
      stepItems.length > 0 &&
      stepItems.some((item) => item.status === 'error') &&
      (stepItems[stepItems.length - 1].status === 'finish' || stepItems[stepItems.length - 1].status === 'error')
    );
  }, [stepItems]);

  const isCreateFinished = useMemo(() => {
    return stepItems.length > 0 && stepItems.every((item) => item.status === 'finish');
  }, [stepItems]);

  const isEveryChainError = useMemo(() => {
    return stepItems.length > 0 && stepItems.every((item) => item.status === 'error');
  }, [stepItems]);

  const showCloseButton = useMemo(() => {
    return isEveryChainError && (isFirstTimeCreation || !isSelectAelfChains);
  }, [isEveryChainError, isSelectAelfChains, isFirstTimeCreation]);

  useEffect(() => {
    const list: TStepItem[] = chains.map((chain) => ({
      chain,
      title: `Creating token on ${chain.chainName}`,
    }));
    list.forEach((item) => {
      item.status = 'process';
      item.isLoading = true;
    });
    setStepItems(list);
  }, [open, chains]);

  useEffect(() => {
    if (open) {
      setIsCreateStart(true);
    }
  }, [open]);

  useEffect(() => {
    if (open && !isCreateStart && isCreateFinished) {
      handleCreateFinish();
    }
  }, [open, isCreateStart, isCreateFinished, handleCreateFinish]);

  useEffect(() => {
    if (!open) {
      setIsCreateStart(false);
      setIsPollingStart(false);
    }
  }, [open]);

  const handleStepItemChange = useCallback(
    ({
      step,
      status,
      params,
    }: {
      step: number;
      status?: ICommonStepsProps['stepItems'][number]['status'];
      params?: {
        bindingId?: string;
        thirdTokenId?: string;
        txHash?: TTxHash;
        isCreated?: boolean;
      };
    }) => {
      setStepItems((prev) => {
        const newStepItems = prev.map((item) => ({ ...item, chain: { ...item.chain } }));
        if (status) {
          newStepItems[step].status = status;
          newStepItems[step].isLoading = status === 'process';
        }
        if (params) {
          newStepItems[step].chain = {
            ...newStepItems[step].chain,
            ...params,
          };
        }
        return newStepItems;
      });
    },
    [],
  );

  const handlePrepareBindIssue = useCallback(
    async (chain: TChainItem) => {
      try {
        if (!evmAccount) {
          throw new Error('No address found');
        }
        const chainId = getChainIdByAPI(chain.chainId || '');
        const contractAddress = getBridgeChainInfo(chainId)?.CREATE_TOKEN_CONTRACT;
        if (!contractAddress) {
          throw new Error('No create token contract found');
        }
        const params: TPrepareBindIssueRequest = {
          address: evmAccount,
          symbol: chain.symbol,
          chainId: chain.chainId,
          contractAddress,
          supply,
        };
        const res = await prepareBindIssue(params);
        if (!res || !res.bindingId || !res.thirdTokenId) {
          throw new Error('Failed to prepare bind issue');
        }
        return res;
      } catch (error: any) {
        error.shouldShowMessage = true;
        console.error(error);
        throw error;
      }
    },
    [evmAccount, supply],
  );

  const handleIssue = useCallback(
    async ({ chain }: { chain: TChainItem }) => {
      try {
        if (!evmAccount) {
          throw new Error('No address found');
        }
        const chainId = getChainIdByAPI(chain.chainId || '');
        const _officialAddress = getBridgeChainInfo(chainId)?.TOKEN_POOL || '';
        const res = await callEVMCreateOfficialTokenRef.current({
          chainId,
          account: evmAccount,
          name: chain.tokenName || 'usdt aa',
          symbol: chain.symbol,
          initialSupply: supply,
          officialAddress: _officialAddress,
          mintToAddress: DEFAULT_EVM_0_ADDRESS,
        });
        if (!res || !res.TransactionId) {
          throw new Error('Failed to create token');
        }
        return res.TransactionId;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [callEVMCreateOfficialTokenRef, evmAccount, supply],
  );

  const handlePollingForIssueResult = useCallback(
    async ({ bindingId, thirdTokenId }: { bindingId?: string; thirdTokenId?: string }) => {
      if (!bindingId || !thirdTokenId) {
        return Promise.resolve();
      }
      try {
        const isFinished = await getApplicationIssue({
          bindingId,
          thirdTokenId,
          mintToAddress: DEFAULT_EVM_0_ADDRESS,
        });
        if (!isFinished) {
          if (poolingTimerForIssueResultRef.current[bindingId]) {
            clearTimeout(poolingTimerForIssueResultRef.current[bindingId]);
          }
          return new Promise<void>((resolve) => {
            poolingTimerForIssueResultRef.current[bindingId] = setTimeout(async () => {
              await handlePollingForIssueResult({ bindingId, thirdTokenId });
              resolve();
            }, POLLING_INTERVAL);
          });
        }
      } catch (error: any) {
        error.shouldShowMessage = true;
        console.error(error);
        throw error;
      }
    },
    [],
  );

  const handlePolling = useCallback(async () => {
    await Promise.all(
      stepItems.map(async (item, index) => {
        if (item.status === 'error' || item.status === 'finish') {
          return;
        }
        try {
          const chainId = getChainIdByAPI(item.chain.chainId || '');
          if (item.chain.txHash && chainId) {
            await getTransactionReceiptAutoRetry({
              hash: item.chain.txHash,
              chainId,
            });
          }
          await handlePollingForIssueResult({
            bindingId: item.chain.bindingId,
            thirdTokenId: item.chain.thirdTokenId,
          });
          handleStepItemChange({ step: index, status: 'finish' });
        } catch (error: any) {
          if (error.shouldShowMessage) {
            CommonMessage.error(handleListingErrorMessage(error));
          }
          handleStepItemChange({ step: index, status: 'error' });
        }
      }),
    );
  }, [handlePollingForIssueResult, handleStepItemChange, stepItems]);

  const handleCreate = useLockCallback(async () => {
    const create = async (step: number) => {
      try {
        const currentChain = stepItems[step].chain;
        if (currentChain.status === ApplicationChainStatusEnum.Unissued) {
          const txHash = await handleIssue({ chain: currentChain });
          const { bindingId, thirdTokenId } = await handlePrepareBindIssue(currentChain);
          handleStepItemChange({
            step,
            params: { bindingId, thirdTokenId, txHash, isCreated: true },
          });
        }
      } catch (error: any) {
        if (error.shouldShowMessage) {
          CommonMessage.error(handleListingErrorMessage(error));
        }
        handleStepItemChange({ step, status: 'error' });
      }
    };

    for (let index = 0; index < stepItems.length; index++) {
      if (stepItems[index].status === 'finish' || stepItems[index].chain.isCreated) {
        continue;
      }
      await create(index);
    }
    setIsPollingStart(true);
  }, [stepItems, handlePrepareBindIssue, handleIssue, handleStepItemChange]);

  useEffect(() => {
    if (open && isCreateStart && stepItems.length > 0) {
      setIsCreateStart(false);
      handleCreate();
    }
  }, [handleCreate, isCreateStart, open, stepItems.length]);

  useEffect(() => {
    if (isPollingStart) {
      setIsPollingStart(false);
      handlePolling();
    }
  }, [isPollingStart, handlePolling]);

  const handleTryAgain = useCallback(() => {
    setStepItems((prev) => {
      const newStepItems = prev.map((item) => ({ ...item, chain: { ...item.chain } }));
      newStepItems.forEach((item) => {
        if (item.status === 'error') {
          item.status = 'process';
          item.isLoading = true;
        }
      });
      return newStepItems;
    });
    setIsCreateStart(true);
  }, []);

  const handleSkip = useCallback(() => {
    const errorChainIds = stepItems.filter((item) => item.status === 'error').map((item) => item.chain.chainId);
    handleCreateFinish({ errorChainIds });
  }, [stepItems, handleCreateFinish]);

  const steps: ICommonStepsProps['stepItems'] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return stepItems.map(({ chain, ...rest }) => rest);
  }, [stepItems]);

  const renderContent = () => {
    const networkList = stepItems.filter((item) => item.status === 'error').map((item) => item.chain.chainId);

    const formattedNetworkList =
      networkList.length > 1
        ? `${networkList.slice(0, -1).join(', ')} and ${networkList[networkList.length - 1]}`
        : networkList[0];

    return (
      <>
        <CommonSteps className={styles['creation-progress-steps']} direction="vertical" hideLine stepItems={steps} />
        {isWarning && (
          <>
            <Remind type={RemindType.ERROR} className={styles['creation-progress-remind']}>
              {`Token creation on the ${formattedNetworkList} networks failed. Would you like to initiate the transaction again?`}
            </Remind>
            <div className={styles['creation-progress-button-wrapper']}>
              <CommonButton
                className={styles['creation-progress-button']}
                onClick={showCloseButton ? handleClose : handleSkip}>
                {showCloseButton ? 'Close' : 'Skip'}
              </CommonButton>
              <CommonButton className={styles['creation-progress-button']} type="primary" onClick={handleTryAgain}>
                Try again
              </CommonButton>
            </div>
          </>
        )}
      </>
    );
  };

  const commonProps = useMemo(() => {
    return {
      title: (
        <div className={styles['creation-progress-title-wrapper']}>
          <span className={styles['creation-progress-title']}>Token Creation in Progress</span>
          <ListingTip
            modalTitle={isMobile ? 'Tips' : ''}
            tip={
              <>
                {!isMobile && <p>Tips:</p>}
                <ul className="list-style-decimal">
                  <li>Please approve the transaction in your wallet to create tokens on each chain.</li>
                  <li>If no wallet popup appears, please open your wallet manually to approve the transaction.</li>
                </ul>
              </>
            }
          />
        </div>
      ),
      closable: false,
      open,
    };
  }, [open, isMobile]);

  if (isMobile) {
    return (
      <Drawer {...commonProps} className={styles['creation-progress-drawer']} height="auto" placement="bottom">
        {renderContent()}
      </Drawer>
    );
  }

  return (
    <CommonModal {...commonProps} className={styles['creation-progress-modal']} width="438px">
      {renderContent()}
    </CommonModal>
  );
}
