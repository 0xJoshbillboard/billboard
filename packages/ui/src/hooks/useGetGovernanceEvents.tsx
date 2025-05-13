import { getDocs, collection } from "firebase/firestore";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
interface GovernanceEvent {
  id: string;
  timestamp: number;
  event: string;
  address: string;
  amount: number;
}

export const useGetGovernanceEvents = () => {
  const [events, setEvents] = useState<GovernanceEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const response = await fetch(
      "https://fetchgovernanceeventsmanual-pe2o27xb6q-ew.a.run.app",
    );
    const data = await response.json();
    setEvents(data);
  };

  const fetchEventsFromFirebase = async () => {
    const events = await getDocs(collection(db, "governance_events"));
    console.log(events.docs.map((doc) => doc.data()));
  };

  const refetchEvents = () => {
    fetchEvents();
  };

  return { events, refetchEvents, fetchEventsFromFirebase };
};
