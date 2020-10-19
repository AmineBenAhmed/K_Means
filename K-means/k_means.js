import { getDistance } from 'geolib';


const updateCentroids = async (labeledPoints, centroids) => {
  const k = centroids.length;
  const newCentroids = []
  for (let i = 0; i < k; i++) {;
    let totalCentroidPoints = 0
    const newCentroidLocation = labeledPoints.reduce((sum, point) => {
      if (point.label === i) {
        sum.latitude += point.location.latitude;
        sum.longitude += point.location.longitude;
        totalCentroidPoints++;
      }

      return sum;

    }, {latitude:0, longitude: 0});
if (!totalCentroidPoints) newCentroids.push({...centroids[i], label: i});
    if (totalCentroidPoints > 0) newCentroids.push({location: { latitude: (newCentroidLocation.latitude/totalCentroidPoints).toFixed(6), longitude: (newCentroidLocation.longitude/totalCentroidPoints).toFixed(6) }, label: i})
  }

  return newCentroids
};

const sortLocations = async (points) => {
  const maxLongitude = Math.max(...points.map(e => e.location.longitude));
  const minLongitude = Math.min(...points.map(e => e.location.longitude));
  const maxLatitude = Math.max(...points.map(e => e.location.latitude));
  const minLatitude = Math.min(...points.map(e => e.location.latitude));

  const longitudeDiff = maxLongitude - minLongitude;
  const latitudeDiff = maxLatitude - minLatitude;
  
  let dividingAxis = '';
  if (longitudeDiff > latitudeDiff) {
    dividingAxis = 'longitude'
  } else { dividingAxis = 'latitude' };

  return points.sort((a, b) => a.location[dividingAxis] - b.location[dividingAxis]);
};

export const getInitialCentroids = async (points, k) => {
  const clustersStep = parseInt(points.length / (k + 1));
  const centroids = [];
  const sortedPoints = await sortLocations(points);
  let index = 0;

  for (let i = 0; i < k; i ++) {
    centroids.push({location: sortedPoints[index].location, label: i});
    index += clustersStep;
  }

  return centroids;
};

// export const validateArrays = (arrayOfArrays) => {
//   const arrayslength = arrayOfArrays[0].length;
//   return (arrayOfArrays.map(function(array) {
//     return array.length == arrayslength;
//   }).reduce((equalLengths, arrayLength) => { return (equalLengths && arrayLength) }, true));
// }

const updatePoints = async (points, centroids) => {

const clusteredPoints = [];

  points.forEach(point => {
    const centroidsDistances = centroids.map(centroid => {
      return{
        distance: getDistance(point.location, centroid.location),
        label: centroid.label 
      }
    }).sort((a,b) => a.distance - b.distance);

      clusteredPoints.push({ ...point, label: centroidsDistances[0].label });
  });
                                                                                                                              
  return clusteredPoints.sort((a, b) => a.label - b.label);
};

const getInSubArrays = async (points, k) => {
  const subArrays = [];
  for (let t = 0; t < k; t++) {
    let subArray = points.reduce((acc, el) => {
      if (el.label === t ) {
        acc.push(el)
      }
      return acc;
    }, []);

    if(subArray.length) subArrays.push(subArray);
  }

  return subArrays;
};

const checkArrayRepetetion = (oldArray, newArray) => {
  const strigifiedArray = newArray.map(elem => JSON.stringify(elem))
return oldArray.reduce((check, elem) => {
    return check && strigifiedArray.includes(JSON.stringify(elem));
    
  }, true)
};

export const getKmeansClusters = async (points, k, config) => {

  const { maxIterations } = config;
  const iterations = maxIterations || 50;
  let centroids = await getInitialCentroids(points, k);
  let labeledPoints = [];
  let oldCentroids = [];

  for (let i=0; i < iterations; i++) {
    labeledPoints = await updatePoints(points, centroids);
    oldCentroids = centroids;
    centroids = await updateCentroids(labeledPoints, centroids);
    
    if (checkArrayRepetetion(centroids, oldCentroids)) break; 

  }

  return getInSubArrays(labeledPoints, k);
};
