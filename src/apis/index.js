import { getConfig } from "../utils/config.js";
import { get24HoursAgoTimestamp } from "../utils/date";
import { apiClient } from "./axios";

export const updateEntriesStatus = async (entryIds, newStatus) =>
  apiClient.put("/v1/entries", {
    entry_ids: entryIds,
    status: newStatus,
  });

export const updateEntryStatus = async (entryId, newStatus) =>
  updateEntriesStatus([entryId], newStatus);

export const toggleEntryStarred = async (entryId) =>
  apiClient.put(`/v1/entries/${entryId}/bookmark`);

export const fetchOriginalArticle = async (entryId) =>
  apiClient.get(`/v1/entries/${entryId}/fetch-content`);

export const getCurrentUser = async () => apiClient.get("/v1/me");

export const getUnreadInfo = async () => apiClient.get("/v1/feeds/counters");

export const getFeeds = async () => apiClient.get("/v1/feeds");

export const getGroups = async () => apiClient.get("/v1/categories");

export const deleteGroup = async (id) =>
  apiClient.delete(`/v1/categories/${id}`);

export const addGroup = async (title) =>
  apiClient.post("/v1/categories", { title });

export const editGroup = async (id, newTitle) =>
  apiClient.put(`/v1/categories/${id}`, { title: newTitle });

export const editFeed = async (feedId, newUrl, newTitle, groupId, isFullText) =>
  apiClient.put(`/v1/feeds/${feedId}`, {
    feed_url: newUrl,
    title: newTitle,
    category_id: groupId,
    crawler: isFullText,
  });

export const refreshFeed = async (feedId) =>
  apiClient.put(`/v1/feeds/${feedId}/refresh`);

export const deleteFeed = async (feedId) =>
  apiClient.delete(`/v1/feeds/${feedId}`);

export const addFeed = async (feedUrl, groupId, isFullText) =>
  apiClient.post("/v1/feeds", {
    feed_url: feedUrl,
    category_id: groupId,
    crawler: isFullText,
  });

export const buildEntriesUrl = (baseParams, extraParams = {}) => {
  const { baseUrl, orderField, direction, offset, limit, status } = baseParams;
  const queryParams = new URLSearchParams({
    ...extraParams,
    order: orderField,
    direction,
    offset,
    limit,
  });

  if (status) {
    queryParams.append("status", status);
  }

  return `${baseUrl}?${queryParams.toString()}`;
};

export const getAllEntries = async (offset = 0, status = null) => {
  const orderBy = getConfig("orderBy");
  const orderDirection = getConfig("orderDirection");
  const pageSize = getConfig("pageSize");
  const baseParams = {
    baseUrl: "/v1/entries",
    orderField: orderBy,
    direction: orderDirection,
    offset,
    limit: pageSize,
    status,
  };

  const url = buildEntriesUrl(baseParams);
  return apiClient.get(url);
};

export const getHistoryEntries = async (offset = 0) => {
  const orderDirection = getConfig("orderDirection");
  const pageSize = getConfig("pageSize");
  const baseParams = {
    baseUrl: "/v1/entries",
    orderField: "changed_at",
    direction: orderDirection,
    offset,
    limit: pageSize,
    status: "read",
  };

  const url = buildEntriesUrl(baseParams);
  return apiClient.get(url);
};

export const getStarredEntries = async (offset = 0, status = null) => {
  const orderDirection = getConfig("orderDirection");
  const pageSize = getConfig("pageSize");
  const baseParams = {
    baseUrl: "/v1/entries",
    orderField: "changed_at",
    direction: orderDirection,
    offset,
    limit: pageSize,
    status,
  };
  const extraParams = { starred: "true" };

  const url = buildEntriesUrl(baseParams, extraParams);
  return apiClient.get(url);
};

export const getTodayEntries = async (
  offset = 0,
  status = null,
  limit = null,
) => {
  const orderBy = getConfig("orderBy");
  const orderDirection = getConfig("orderDirection");
  const pageSize = limit || getConfig("pageSize");
  const timestamp = get24HoursAgoTimestamp();
  const baseParams = {
    baseUrl: "/v1/entries",
    orderField: orderBy,
    direction: orderDirection,
    offset,
    limit: pageSize,
    status,
  };
  const extraParams = { published_after: timestamp };

  const url = buildEntriesUrl(baseParams, extraParams);
  return apiClient.get(url);
};
