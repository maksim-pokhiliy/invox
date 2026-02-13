export const TIME_TRACKING = {
  TOGGL_API_BASE_URL: "https://api.track.toggl.com/api/v9",
  TOGGL_REPORTS_BASE_URL: "https://api.track.toggl.com/reports/api/v3",
  ROUNDING_OPTIONS: [0, 1, 5, 6, 10, 12, 15, 30, 60] as readonly number[],
  SECONDS_PER_HOUR: 3600,
  IMPORT_DRAWER_WIDTH: 1000,
  DEFAULT_DATE_RANGE_DAYS: 30,
} as const;
