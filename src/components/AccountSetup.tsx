import React, { useState } from 'react';
import { Clock, Globe, Calendar, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AccountSetupProps {
  userId: string;
  onComplete: () => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ userId, onComplete }) => {
  const [deliveryTime, setDeliveryTime] = useState('09:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          delivery_time: deliveryTime,
          timezone,
          frequency,
          custom_days: frequency === 'custom' ? customDays : []
        });

      if (error) throw error;
      onComplete();
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Experience</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Delivery Time
          </label>
          <select
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, '0');
              return (
                <option key={`${hour}:00`} value={`${hour}:00`}>
                  {`${hour}:00`} {i < 12 ? 'AM' : 'PM'}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Time Zone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {Intl.supportedValuesOf('timeZone').map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Frequency
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="daily"
                checked={frequency === 'daily'}
                onChange={(e) => setFrequency(e.target.value as 'daily')}
                className="mr-2"
              />
              Every day
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="weekdays"
                checked={frequency === 'weekdays'}
                onChange={(e) => setFrequency(e.target.value as 'weekdays')}
                className="mr-2"
              />
              Weekdays only
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={frequency === 'custom'}
                onChange={(e) => setFrequency(e.target.value as 'custom')}
                className="mr-2"
              />
              Custom days
            </label>
          </div>

          {frequency === 'custom' && (
            <div className="mt-3 pl-6">
              {weekdays.map((day, index) => (
                <label key={day} className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={customDays.includes(index)}
                    onChange={(e) => {
                      setCustomDays(
                        e.target.checked
                          ? [...customDays, index]
                          : customDays.filter((d) => d !== index)
                      );
                    }}
                    className="mr-2"
                  />
                  {day}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Preview
          </h3>
          <p className="text-sm text-blue-700">
            You'll receive quotes {frequency === 'daily' ? 'every day' : frequency === 'weekdays' ? 'Monday through Friday' : 'on selected days'} at {deliveryTime} ({timezone})
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
};

export default AccountSetup;