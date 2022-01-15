import axios from "axios";

/**
 * This script crawls the marketplace to find a list of the cheapest(in terms of BUSD/power rating) listings
 * for a given hero and rarity
 *
 * PRE-REQUISITE:
 * 1. Make sure typescript and ts-node is installed
 *
 * HOW TO USE:
 * 1. Get cookie by visiting elemon.io
 * 2. To find the baseCardId of the hero you want, go to https://app.elemon.io/market,
 *  select hero you want in the filter, open network inspector and look at the http request url
 * 3. Run: ts-node path/to/directory/marketplace-adhoc.ts
 *
 * Most important stats: powerRating, lastPrice, costPerPowerRating
 */

const baseCardStringToId: Record<string, number> = {
  legolas: 11,
  scary: 19,
  ties: 21,
  kuroo: 22,
};

const heroRarityStringToId: Record<string, number> = {
  A: 2,
  S: 3,
};

const bodyPartQualityIdToString: Record<number, string> = {
  4: "rare",
  5: "epic 1",
  6: "epic 2",
  7: "legend 1",
  8: "legend 2",
  9: "Mythical",
};

// TODO: get cookie by visiting any page from elemon website
const cookie =
  "_ga=GA1.1.1462171630.1641993109; cf_clearance=LNuqb2Gp20JgHMxQJjwVT.RHQCqN5r3xO1UDyR8V8pw-1642150040-0-150; _ga_LMWK02S9ZZ=GS1.1.1642150040.16.1.1642150043.0";
const referer = "https://app.elemon.io/market";
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";

const header = {
  cookie,
  referer,
  "user-agent": userAgent,
};

const auraQualityMap: Record<number, string> = {
  3: "gray",
  4: "purple",
  5: "orange",
  6: "red",
};

const rarityMap: Record<number, string> = {
  2: "A",
  3: "S",
};

const start = async () => {
  let result = [];

  const elemonsData = await getElemonsData();
  // Get elemon info
  for (const r of elemonsData) {
    const {
      tokenId: elemonId,
      lastPrice,
      rarity,
      purity,
      baseCardId,
      class: clazz,
      quality: auraQuality,
    } = r;

    const { level, point, star, bodyPart, skills } = await getElemonInfo(
      elemonId
    );
    result.push({
      elemonId,
      baseCardId,
      lastPrice: lastPrice / Math.pow(10, 18),
      rarity: rarityMap[rarity],
      purity,
      class: clazz,
      aura: auraQualityMap[auraQuality],
      level,
      powerRating: point,
      costPerPowerRating: lastPrice / Math.pow(10, 18) / point,
      star,
      bodyPart: bodyPart.map((b: any) => ({
        ...b,
        quality: bodyPartQualityIdToString[b.quality] || b.quality,
      })),
      skills,
      // stats: points,
    });
    await sleep();
  }

  console.log(`--- COMPLETED RETRIEVING ALL DATA ---`);

  result = filterResults(result);
  result.sort((a, b) => a.costPerPowerRating - b.costPerPowerRating);

  const cheapestListings = result.slice(0, 10);
  console.log("--- CHEAPEST LISTINGS ---");
  console.log(JSON.stringify(cheapestListings, undefined, 2));

  const mostExpensiveListings = result.slice(result.length - 10);
  console.log("--- MOST EXPENSIVE LISTINGS ---");
  console.log(JSON.stringify(mostExpensiveListings, undefined, 2));
};

const filterResults = (result: any[]) => {
  return result.filter((r) => r.aura === "orange" || r.aura === "red");
};

/**
 * Get elemons in market
 * response: {
 *  data: [{
 *     tokenId,
 *     lastPrice,
 *     ownerAddress,
 *     rarity,
 *     purity,
 *     class,
 *     quality
 *   }],
 *  paging: {
 *    page, pageSize, totalCount
 *  }
 * }
 */
const getElemonsData = async () => {
  let pageNumber = 1;
  const pageSize = 50;
  const elemonsData = [];
  let hasMoreItems = true;

  while (hasMoreItems) {
    console.log(
      `--- GETTING ELEMONS MARKET DATA PAGE ${pageNumber}, PAGE SIZE ${pageSize} ---`
    );
    const elemonsResponse = await axios.get(
      `https://app.elemon.io/market/getElemonItems?pageNumber=${pageNumber}&pageSize=${pageSize}&positionType=2&priceMode=&baseCardId=${baseCardStringToId.legolas}&tokenId=&rarities=${heroRarityStringToId.S}&classes=&purities=&address=`,
      {
        withCredentials: true,
        headers: header,
      }
    );

    elemonsData.push(...elemonsResponse.data.data);

    const { paging } = elemonsResponse.data;
    console.log(`TOTAL COUNT: ${paging.totalCount}`);
    hasMoreItems = paging.totalCount > paging.page * paging.pageSize;
    await sleep();
    pageNumber++;
  }

  return elemonsData;
};

/**
 * response: {
 *    data: [{
 *      level,
 *      point,
 *      star,
 *      bodyPart: [{
 *          type, quality, ability, val
 *      }],
 *      skills: [{
 *        skillImg, level, skillId
 *      }]
 *    }]
 * }
 */
const getElemonInfo = async (elemonId: number) => {
  console.log(`--- GETTING ELEMON DATA FOR ID ${elemonId} ---`);
  const elemonsResponse = await axios.get(
    `https://app.elemon.io/elemon/getElemonInfo?tokenId=${elemonId}`,
    {
      withCredentials: true,
      headers: header,
    }
  );

  if (!elemonsResponse.data.data?.[0]) {
    console.log(`Invalid data found`, { data: elemonsResponse.data.data });
    return null;
  }
  const { level, point, star, bodyPart, skills, points } =
    elemonsResponse.data.data?.[0];

  return { level, point, star, bodyPart, skills, points };
};

const sleep = (ms?: number) => {
  if (!ms) {
    ms = 200 + Math.random() * 1000;
  }
  console.log(`Sleeping for ${ms / 1000} seconds`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

start();
