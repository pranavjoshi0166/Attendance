import { useQuery } from "@tanstack/react-query";

export interface Statistics {
  totalLectures: number;
  attendedLectures: number;
  missedLectures: number;
  attendancePercentage: number;
  breakdown: {
    present: number;
    absent: number;
    requisition: number;
  };
  subjects: number;
}

const emptyStats: Statistics = {
  totalLectures: 0,
  attendedLectures: 0,
  missedLectures: 0,
  attendancePercentage: 0,
  breakdown: {
    present: 0,
    absent: 0,
    requisition: 0,
  },
  subjects: 0,
};

export function useStatistics() {
  return useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/statistics");
        if (!res.ok) {
          console.error("Failed to fetch statistics:", res.status, res.statusText);
          return emptyStats;
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching statistics:", error);
        return emptyStats;
      }
    },
    initialData: emptyStats,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}
