import { useQuery } from "@tanstack/react-query";

export interface Statistics {
  totalLectures: number;
  attendedLectures: number;
  missedLectures: number;
  attendancePercentage: number;
  breakdown: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  subjects: number;
}

export function useStatistics() {
  return useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/statistics");
        if (!res.ok) {
          console.error("Failed to fetch statistics:", res.status, res.statusText);
          return {
            totalLectures: 0,
            attendedLectures: 0,
            missedLectures: 0,
            attendancePercentage: 0,
            breakdown: {
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
            },
            subjects: 0,
          };
        }
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching statistics:", error);
        return {
          totalLectures: 0,
          attendedLectures: 0,
          missedLectures: 0,
          attendancePercentage: 0,
          breakdown: {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
          },
          subjects: 0,
        };
      }
    },
    initialData: {
      totalLectures: 0,
      attendedLectures: 0,
      missedLectures: 0,
      attendancePercentage: 0,
      breakdown: {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      },
      subjects: 0,
    },
  });
}
