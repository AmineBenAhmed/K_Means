import { getKmeansClusters } from './k_means';
import { silhouhette_K } from './silhouhette_method';

const k_means = async (locations) => {
  const { k } = await silhouhette_K(locations);

  return getKmeansClusters(locations, k);
}
