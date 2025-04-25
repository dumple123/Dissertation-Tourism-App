import Entrance from '~/components/Styles/MakiMobile/Entrance';
import EntranceAlt1 from '~/components/Styles/MakiMobile/EntranceAlt1';
import Elevator from '~/components/Styles/MakiMobile/Elevator';
import Information from '~/components/Styles/MakiMobile/Information';
import Toilet from '~/components/Styles/MakiMobile/Toilet';

export type MarkerType =
  | 'entrance'
  | 'stairs'
  | 'lift'
  | 'restroom'
  | 'information'
  | 'other';

export interface MarkerTypeInfo {
  label: string;
  Component?: React.FC<any>;
  fallbackEmoji?: string;
}

export const markerTypesMobile: Record<MarkerType, MarkerTypeInfo> = {
  entrance: {
    label: 'Entrance',
    Component: EntranceAlt1,
    fallbackEmoji: '🚪',
  },
  stairs: {
    label: 'Stairs',
    Component: Entrance,
    fallbackEmoji: '🪜',
  },
  lift: {
    label: 'Lift',
    Component: Elevator,
    fallbackEmoji: '🛗',
  },
  restroom: {
    label: 'Restroom',
    Component: Toilet,
    fallbackEmoji: '🚻',
  },
  information: {
    label: 'Information',
    Component: Information,
    fallbackEmoji: 'ℹ️',
  },
  other: {
    label: 'Other',
    fallbackEmoji: '❓',
  },
};
