import { getDistance } from 'geolib';

import { getKmeansClusters } from './k_means';

const getDistancesMean = (a, points, multi) => {
  const distancesSum = points.reduce((sum, point) => {
    const dist = getDistance(a.location, point.location);
      return sum + dist;
  }, 0);

  return multi ? distancesSum / (points.length) : distancesSum / (points.length - 1)
}

const getSi = (a, clusters, i) => {
  const cluster = clusters.splice(i,1);

  const Ai = getDistancesMean(a, ...cluster);
  const clustersMeans = clusters.map((cluster) =>  {

    return getDistancesMean(a, cluster, true);
  }).filter(e => e)

  const Bi = Math.min(...clustersMeans)
  clusters.splice(i, 0, ...cluster);

  return ((Bi - Ai) / (Math.max(Ai, Bi)));
}

export const silhouhette_K = async (points, Kmax) => {

  let K_max = Kmax || 22;

  const allSi = []

  for (let k = 6; k <= K_max; k++) {

    const clusters = await getKmeansClusters(points, k, 50);
    let siSum = clusters.map((cluster, i) => {
        return cluster.reduce( (sumSi, point) => {
          if (cluster.length > 1) {
          return sumSi + getSi(point, clusters, i);
          } else { return sumSi + 0 }
        }, 0);
    }).reduce((sum, el) => {
      return (sum + el);  
    }, 0);

    allSi.push({ mean: siSum / points.length, k });
  }

  return allSi.sort((a,b)=> b.mean - a.mean)[0];
}
