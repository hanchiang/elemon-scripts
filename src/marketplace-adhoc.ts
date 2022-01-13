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

const baseCardStringToId = {
  legolas: 11,
  scary: 19,
  ties: 21,
  kuroo: 22,
};

const heroRarityStringToid = {
  A: 2,
  S: 3,
};

const bodyPartIdToString = {
  4: "rare",
  5: "epic 1",
  6: "epic 2",
  7: "legend 1",
  8: "legend 2",
};

// TODO: get cookie by visiting any page from elemon website
const cookie =
  "_ga=GA1.1.1462171630.1641993109; cf_clearance=BI2FaEMcJxCz5zj15qso6iTlZ83kspM9Nn6enK6nPqk-1642075673-0-150; cf_ob_info=502:6cce9bcf1b056c09:SIN; cf_use_ob=0; _ga_LMWK02S9ZZ=GS1.1.1642073699.10.1.1642076755.0";
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
  let pageNumber = 1;
  const pageSize = 50;

  const result = [];

  // Get elemons in market
  /**
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

  const elemonsData = [];
  let hasMoreItems = true;
  while (hasMoreItems) {
    console.log(
      `--- GETTING ELEMONS MARKET DATA PAGE ${pageNumber}, PAGE SIZE ${pageSize} ---`
    );
    const elemonsResponse = await axios.get(
      `https://app.elemon.io/market/getElemonItems?pageNumber=${pageNumber}&pageSize=${pageSize}&positionType=2&priceMode=&baseCardId=${baseCardStringToId.legolas}&tokenId=&rarities=${heroRarityStringToid.S}&classes=&purities=&address=`,
      {
        withCredentials: true,
        headers: header,
      }
    );

    elemonsData.push(...elemonsResponse.data.data);

    const { paging } = elemonsResponse.data;
    hasMoreItems = paging.totalCount > paging.page * paging.pageSize;
    await sleep();
    pageNumber++;
  }

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
      continue;
    }
    const { level, point, star, bodyPart, skills, points } =
      elemonsResponse.data.data?.[0];
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
      bodyPart,
      skills,
      stats: points,
    });
    await sleep();
  }

  console.log(`--- COMPLETED RETRIEVING ALL DATA ---`);

  result.sort((a, b) => a.costPerPowerRating - b.costPerPowerRating);

  console.log(result.slice(0, 20));
};

const sleep = (ms?: number) => {
  if (!ms) {
    ms = 100 + Math.random() * 500;
  }
  console.log(`Sleeping for ${ms / 1000} seconds`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

start();
