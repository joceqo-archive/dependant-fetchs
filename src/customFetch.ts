let requestCount = 0;

const customFetch = async (url: string, options?: RequestInit, customOptions:{
  maxRequests?: number;
  resetTime?: number;
  delay?: number;
}={
  maxRequests: 20,
  resetTime: 60000,
  delay: undefined,
}): Promise<Response> => {
  requestCount++;
  
  if (customOptions.maxRequests && requestCount > customOptions.maxRequests) {
    return new Response(null, { status: 429, statusText: 'Too Many Requests' });
  }

  const response = await fetch(url, options);

  setTimeout(() => {
    requestCount = 0;
  }, customOptions.resetTime);

  if(customOptions.delay){
    await new Promise(resolve => setTimeout(resolve, customOptions.delay));
  }

  return response;
};


export const delayFetch = (delay: number) => {
  return (url: string, options?: RequestInit) => {
    return customFetch(url, options, {
      delay: delay,
    });
  }
}

export const maxRequestsFetch = (maxRequests: number, resetTime?: number) => {
  return (url:string,options?:RequestInit) => {
    return customFetch(url, options, {
      maxRequests: maxRequests,
      resetTime: resetTime || 60_000,
    });
  }
};


export const _fetch = delayFetch(2000)

