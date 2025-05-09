export type MarkerType =
  | 'entrance'
  | 'stairs'
  | 'lift'
  | 'restroom'
  | 'information'
  | 'other';

export interface MarkerTypeInfo {
  label: string;
  icon?: string; // Optional icon (SVG base64)
  fallbackEmoji?: string;
}

export const markerTypes: Record<MarkerType, MarkerTypeInfo> = {
  stairs: {
    label: 'stairs',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBoZWlnaHQ9IjE1IiB2aWV3Qm94PSIwIDAgMTUgMTUiIHdpZHRoPSIxNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBpZD0iZW50cmFuY2UiPgogIDxwYXRoIGQ9Im04IDYuNXYtMWMwLS4yNjUyMi0uMTA1MzYtLjUxOTU3LS4yOTI4OS0uNzA3MTEtLjE4NzU0LS4xODc1My0uNDQxODktLjI5Mjg5LS43MDcxMS0uMjkyODlzLS41MTk1Ny4xMDUzNi0uNzA3MTEuMjkyODljLS4xODc1My4xODc1NC0uMjkyODkuNDQxODktLjI5Mjg5LjcwNzExdjN6bS0yLTMuNWMwLS4xOTc3OC4wNTg2NS0uMzkxMTIuMTY4NTMtLjU1NTU3cy4yNjYwNi0uMjkyNjIuNDQ4NzktLjM2ODMxYy4xODI3Mi0uMDc1NjkuMzgzNzktLjA5NTQ5LjU3Nzc3LS4wNTY5LjE5Mzk4LjAzODU4LjM3MjE2LjEzMzgyLjUxMjAyLjI3MzY3LjEzOTg1LjEzOTg2LjIzNTA5LjMxODA0LjI3MzY4LjUxMjAyLjAzODU4LjE5Mzk4LjAxODc4LjM5NTA1LS4wNTY5MS41Nzc3Ny0uMDc1NjkuMTgyNzMtLjIwMzg2LjMzODkxLS4zNjgzMS40NDg3OXMtLjM1Nzc5LjE2ODUzLS41NTU1Ny4xNjg1M2MtLjI2NTIyIDAtLjUxOTU3LS4xMDUzNi0uNzA3MTEtLjI5Mjg5LS4xODc1My0uMTg3NTQtLjI5Mjg5LS40NDE4OS0uMjkyODktLjcwNzExem05IDNjMCAuMjY1MjItLjEwNTQuNTE5NTctLjI5MjkuNzA3MTEtLjE4NzUuMTg3NTMtLjQ0MTkuMjkyODktLjcwNzEuMjkyODloLTEuNThjLS4xMzE2LS4wMDA3Ni0uMjYyMS4wMjQ0Ni0uMzgzOS4wNzQyMy0uMTIxOC4wNDk3Ni0uMjMyNy4xMjMwOS0uMzI2MS4yMTU3N2wtNS40MiA1LjQyYy0uMTg2MjYuMTg0Ny0uNDM3NjYuMjg4OS0uNy4yOWgtMi41OWMtLjI2NTIyIDAtLjUxOTU3LS4xMDU0LS43MDcxMS0uMjkyOS0uMTg3NTMtLjE4NzUtLjI5Mjg5LS40NDE5LS4yOTI4OS0uNzA3MXMuMTA1MzYtLjUxOTYuMjkyODktLjcwNzFjLjE4NzU0LS4xODc1LjQ0MTg5LS4yOTI5LjcwNzExLS4yOTI5aDEuNTljLjI2MjM0LS4wMDExLjUxMzc0LS4xMDUzLjctLjI5bDUuNDItNS40MmMuMDkzNC0uMDkyNjguMjA0My0uMTY2MDEuMzI2MS0uMjE1NzcuMTIxOC0uMDQ5NzcuMjUyMy0uMDc0OTkuMzgzOS0uMDc0MjNoMi41OGMuMjY1MiAwIC41MTk2LjEwNTM2LjcwNzEuMjkyODkuMTg3NS4xODc1NC4yOTI5LjQ0MTg5LjI5MjkuNzA3MTF6Ii8+Cjwvc3ZnPg==',
  },
  entrance: {
    label: 'entrance',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iZW50cmFuY2UtYWx0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSI+CiAgPHBhdGggZD0iTTYuNTU0LDkuNjM5YS41LjUsMCwwLDAsLjcwNy43MDdMOS45MjgsNy42NjlhLjI1LjI1LDAsMCwwLDAtLjM1NGgwTDcuMjYxLDQuNjM5YS41LjUsMCwwLDAtLjcwNy43MDdMOC4yLDdIMS41YS41LjUsMCwwLDAsMCwxSDguMlpNMTIsMUg1LjVhLjUuNSwwLDAsMCwwLDFoNmEuNS41LDAsMCwxLC41LjV2MTBhLjUuNSwwLDAsMS0uNS41SDUuMjVhLjUuNSwwLDAsMCwwLDFIMTJhMSwxLDAsMCwwLDEtMVYyQTEsMSwwLDAsMCwxMiwxWiIvPgo8L3N2Zz4=',
  },
  lift: {
    label: 'Lift',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJlbGV2YXRvciIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiB2aWV3Qm94PSIwIDAgMTUgMTUiPgogIDxwYXRoIGQ9Ik0xMSwxSDRBMSwxLDAsMCwwLDMsMlYxM2ExLDEsMCwwLDAsMSwxaDdhMSwxLDAsMCwwLDEtMVYyQTEsMSwwLDAsMCwxMSwxWk03LjUsMTIuNWwtMi00aDRabS0yLTYsMi00LDIsNFoiLz4KPC9zdmc+',
  },
  restroom: {
    label: 'Restroom',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBpZD0idG9pbGV0Ij4KICA8cGF0aCBkPSJNMyAxLjVhMS41IDEuNSAwIDEgMCAzIDAgMS41IDEuNSAwIDAgMC0zIDBaTTExLjUgMGExLjUgMS41IDAgMSAxIDAgMyAxLjUgMS41IDAgMCAxIDAtM1pNMy4yOSA0YTEgMSAwIDAgMC0uODY4LjUwNEwuNTY2IDcuNzUyYS41LjUgMCAxIDAgLjg2OC40OTZsMS40MTItMi40NzJBMzQ1LjA0OCAzNDUuMDQ4IDAgMCAwIDEgMTFoMnYyLjVhLjUuNSAwIDAgMCAxIDBWMTFoMXYyLjVhLjUuNSAwIDAgMCAxIDBWMTFoMkw2LjEwMyA1LjY4N2wxLjQ2MyAyLjU2MWEuNS41IDAgMSAwIC44NjgtLjQ5Nkw2LjU3OCA0LjUwNEExIDEgMCAwIDAgNS43MSA0SDMuMjlaTTkgNC41YS41LjUgMCAwIDEgLjUtLjVoNGEuNS41IDAgMCAxIC41LjV2NWEuNS41IDAgMCAxLTEgMHY0YS41LjUgMCAwIDEtMSAwdi00aC0xdjRhLjUuNSAwIDAgMS0xIDB2LTRhLjUuNSAwIDAgMS0xIDB2LTVaIi8+Cjwvc3ZnPg==',
  },
  information: {
    label: 'Information',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJpbmZvcm1hdGlvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNSAxNSI+CiAgPHBhdGggaWQ9InJlY3Q4Mzk5IiBkPSJNNy41LDEmI3hBOyYjeDk7QzYuNywxLDYsMS43LDYsMi41UzYuNyw0LDcuNSw0UzksMy4zLDksMi41UzguMywxLDcuNSwxeiBNNCw1djFjMCwwLDIsMCwyLDJ2MmMwLDItMiwyLTIsMnYxaDd2LTFjMCwwLTIsMC0yLTJWNmMwLTAuNS0wLjUtMS0xLTFINCYjeEE7JiN4OTt6Ii8+Cjwvc3ZnPg==',
  },
  other: {
    label: 'Other',
    // No icon
  },
};