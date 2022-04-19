import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import tzPlugin from 'dayjs/plugin/timezone';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';
import localizedFormatPLugin from 'dayjs/plugin/localizedFormat';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

dayjs.extend(utcPlugin);
dayjs.extend(tzPlugin);
dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormatPLugin);

export const dateFromNow = (date: dayjs.ConfigType, withoutSuffix = false): string => {
	return dayjs.utc(date).fromNow(withoutSuffix);
};

export const dateToNow = (date: dayjs.ConfigType, withoutSuffix = false): string => {
	return dayjs.utc(date).toNow(withoutSuffix);
};

export const dateFromTimestamp = (ts: Timestamp | undefined) => {
	// @ts-ignore
	return new Date(ts?.seconds.low);
};

export const toLocaleDateFormat = (date: dayjs.ConfigType): string => dayjs.utc(date).format('lll');
