import { CrossChainTimeList } from 'constants/index';
import Moment from 'moment';
import { ChainId } from 'types';
import { isIncludesChainId } from 'utils';

const getMillisecond = (time: any) => {
  const { seconds } = time || {};
  const tim = seconds || time;
  if (String(tim).length <= 10) {
    return tim * 1000;
  }
  if (typeof tim !== 'number') {
    return Number(tim);
  }
  return tim;
};
export function formatTime(t: string | number, formats = 'YYYY-MM-DD HH:MM:SS') {
  if (t && typeof t === 'string' && !t.includes('T') && !t.includes('-'))
    return Moment(getMillisecond(t)).format(formats);
  return Moment(t).format(formats);
}

export function getCrossChainTime(fromChainId?: ChainId, toChainId?: ChainId) {
  const item = CrossChainTimeList.find(
    (i) => isIncludesChainId(i.fromChainId, fromChainId) && isIncludesChainId(i.toChainId, toChainId),
  );
  return item?.time || '10';
}

export function getFullYear(): number {
  const data: Date = new Date();
  return data.getFullYear();
}
