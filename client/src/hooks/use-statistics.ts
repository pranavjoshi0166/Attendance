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
  });
}
