import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '../lib/api';

const useAuthUser = () => {
  const authUser =useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, //auth check for just one time
    // staleTime: 60_000, // it is for cache time, gives cache lifetime of 1min
  });

  return {isLoading: authUser.isLoading, authUser: authUser.data?.user };
}

export default useAuthUser;