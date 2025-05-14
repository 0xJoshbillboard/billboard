import { getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { GovernanceEvent } from "../utils/types";

export const useGetGovernanceEvents = () => {
  const [events, setEvents] = useState<GovernanceEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "governance_events"));
      const data = snapshot.docs.map((doc) => doc.data()) as GovernanceEvent[];
      const groupedByAdvertiser = data.reduce(
        (acc, event) => {
          if (event.advertiser) {
            const eventWithDate = {
              ...event,
              timestampDate: event.timestamp ? new Date(event.timestamp) : null,
            };

            if (!acc[event.advertiser]) {
              acc[event.advertiser] = [];
            }
            acc[event.advertiser].push(eventWithDate);
          }
          return acc;
        },
        {} as Record<string, GovernanceEvent[]>,
      );

      const mergedEvents = Object.entries(groupedByAdvertiser).map(
        ([advertiser, events]) => {
          return events.reduce((merged, event) => {
            return {
              ...merged,
              ...event,
              advertiser,
            };
          }, {} as GovernanceEvent);
        },
      );

      setEvents(mergedEvents);
    } catch (error) {
      console.error("Error fetching governance events:", error);
    } finally {
      setLoading(false);
    }
  };

  const refetchEvents = () => {
    fetchEvents();
  };

  return { events, refetchEvents, loading };
};
