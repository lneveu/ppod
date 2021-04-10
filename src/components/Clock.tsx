import React, { useEffect, useState } from 'react';
import { getFormatedMissionTime } from '../utils/marsDate';

function Clock() {
  const [missionTime, setMissionTime] = useState(getFormatedMissionTime());

  useEffect(() => {
    const i = setInterval(() => {
      setMissionTime(getFormatedMissionTime());
    }, 900); // update every mars seconds

    return () => clearInterval(i);
  }, []);

  return (
    <div className="clock">
      <div>
        <span className="clock__time-value">{missionTime.sol}</span>
        <span className="clock__time-label">SOL</span>
      </div>
      <div>
        <span className="clock__time-value">{missionTime.hrs}</span>
        <span className="clock__time-label">HRS</span>
      </div>
      <div>
        <span className="clock__time-value">{missionTime.mins}</span>
        <span className="clock__time-label">MINS</span>
      </div>
      <div>
        <span className="clock__time-value">{missionTime.secs}</span>
        <span className="clock__time-label">SECS</span>
      </div>
    </div>
  );
}

export default Clock;
