export interface MembershipTier {
  name: string;
  discountPercentage: number;
  minTrips: number;
  nextTierTrips: number | null;
}

export const getMembershipTier = (totalTrips: number): MembershipTier => {
  if (totalTrips <= 1) {
    return { name: 'Bronze', discountPercentage: 1, minTrips: 0, nextTierTrips: 2 };
  }
  if (totalTrips <= 5) {
    return { name: 'Silver', discountPercentage: 3, minTrips: 2, nextTierTrips: 6 };
  }
  if (totalTrips <= 10) {
    return { name: 'Gold', discountPercentage: 5, minTrips: 6, nextTierTrips: 11 };
  }
  if (totalTrips <= 20) {
    return { name: 'Platinum', discountPercentage: 8, minTrips: 11, nextTierTrips: 21 };
  }
  if (totalTrips <= 35) {
    return { name: 'Diamond', discountPercentage: 10, minTrips: 21, nextTierTrips: 36 };
  }
  if (totalTrips <= 50) {
    return { name: 'Elite', discountPercentage: 12, minTrips: 36, nextTierTrips: 51 };
  }
  return { name: 'Legend', discountPercentage: 15, minTrips: 51, nextTierTrips: null };
};
