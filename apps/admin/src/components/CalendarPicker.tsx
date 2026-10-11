import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import 'react-multi-date-picker/styles/colors/red.css';
import { Input } from 'antd';
import { calendarInput, calendarValue } from '../lib/calendar';

export default function CalendarPicker({
  value,
  onChange,
  withTime = false,
  disabled = false,
  clearable = true,
  id,
}: {
  value?: string | null;
  onChange?: (value: string | null) => void;
  withTime?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  id?: string;
}) {
  return (
    <div dir="rtl" className="w-full min-w-44">
      <DatePicker
        value={calendarValue(value, withTime)}
        onChange={(date) => onChange?.(calendarInput(date, withTime))}
        calendar={persian}
        className="red !font-sans"
        locale={persianFa}
        calendarPosition="bottom-right"
        disabled={disabled}
        format={withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD'}
        containerClassName="w-full"
        zIndex={1500}
        plugins={withTime ? [<TimePicker key="time" hideSeconds />] : []}
        render={(formatted, openCalendar) => (
          <Input
            id={id}
            value={formatted}
            readOnly
            disabled={disabled}
            placeholder="تقویم"
            aria-label={id ? undefined : 'تقویم'}
            onClick={openCalendar}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCalendar();
              }
            }}
            allowClear={clearable && Boolean(value)}
            onClear={() => onChange?.(null)}
            className="cursor-pointer"
          />
        )}
      />
    </div>
  );
}
