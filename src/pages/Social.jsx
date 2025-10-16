import React, { useEffect, useState } from 'react';
// import { fetchFeedPosts } from '../firebase/socialFeed';
import { fetchPrivateFeedPosts } from '../firebase/privateFeed';
import { fetchDirectShares } from '../firebase/directShares';
import SocialFeed from '../components/SocialFeed';
import FriendsPanel from '../components/FriendsPanel';
import NotificationsPanel from '../components/NotificationsPanel';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useBreakpointValue,
  useMediaQuery,
} from '@chakra-ui/react';
import {
  FaGlobeAmericas,
  FaUserFriends,
  FaInbox,
  FaUserPlus,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Social() {
  const { user } = useAuth();
  const tabOrientation = useBreakpointValue({
    base: 'horizontal',
    md: 'horizontal',
  });
  const [isMobile] = useMediaQuery('(max-width: 480px)');
  // No Public Feed (removed for gold-standard privacy/cost)
  // Friends Feed
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState('');
  // Direct Shares
  const [directShares, setDirectShares] = useState([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState('');

  // No Public Feed (removed for gold-standard privacy/cost)

  // Load friends feed (aggregate all friends' private posts)
  useEffect(() => {
    async function loadFriendsFeed() {
      if (!user) return;
      setFriendsLoading(true);
      setFriendsError('');
      try {
        // Get friend IDs
        const res = await import('../firebase/friends');
        const { getUserProfile } = await import('../firebase/userProfile');
        const friends = await res.getFriends(user.uid);
        let allPosts = [];
        for (const friend of friends) {
          // Limit to 10 most recent posts per friend for performance
          const posts = await fetchPrivateFeedPosts(friend.id);
          const profile = await getUserProfile(friend.id);
          allPosts = allPosts.concat(
            posts.slice(0, 10).map((p) => ({
              ...p,
              userId: friend.id,
              userName: profile?.displayName || profile?.email || friend.id,
              userPhotoUrl: profile?.photoURL || null,
            })),
          );
        }
        // Sort by timestamp desc
        allPosts.sort(
          (a, b) =>
            (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0),
        );
        setFriendsPosts(allPosts);
      } catch (e) {
        setFriendsError('Failed to load friends feed.');
      }
      setFriendsLoading(false);
    }
    if (user) loadFriendsFeed();
  }, [user]);

  // Load direct shares
  useEffect(() => {
    async function loadDirectShares() {
      if (!user) return;
      setDirectLoading(true);
      setDirectError('');
      try {
        const data = await fetchDirectShares(user.uid);
        setDirectShares(data);
      } catch (e) {
        setDirectError('Failed to load direct shares.');
      }
      setDirectLoading(false);
    }
    if (user) loadDirectShares();
  }, [user]);

  return (
    <Box
      maxW={{ base: '100%', md: '600px' }}
      mx="auto"
      py={6}
      px={{ base: 1, md: 4 }}
    >
      <Heading as="h1" size="lg" mb={4} textAlign="center">
        Social
      </Heading>
      <NotificationsPanel />
      <Tabs
        variant="enclosed"
        isLazy
        orientation={tabOrientation}
        isFitted={false}
        overflowX="auto"
        minW={0}
        w="100%"
        size={isMobile ? 'sm' : 'md'}
      >
        <TabList
          mb={4}
          overflowX="auto"
          sx={{
            scrollbarWidth: 'auto',
            msOverflowStyle: 'auto',
            '&::-webkit-scrollbar': { height: '6px', background: '#f0f0f0' },
            '&::-webkit-scrollbar-thumb': {
              background: '#ccc',
              borderRadius: '3px',
            },
          }}
        >
          {/* Public Feed Tab removed */}
          <Tab
            minW={isMobile ? '60px' : '120px'}
            px={isMobile ? 3 : 4}
            fontSize={isMobile ? 'xs' : 'md'}
          >
            <Icon
              as={FaUserFriends}
              boxSize={isMobile ? 4 : 5}
              mr={isMobile ? 0 : 2}
            />
            {!isMobile && 'Friends Feed'}
          </Tab>
          <Tab
            minW={isMobile ? '60px' : '120px'}
            px={isMobile ? 3 : 4}
            fontSize={isMobile ? 'xs' : 'md'}
          >
            <Icon
              as={FaInbox}
              boxSize={isMobile ? 4 : 5}
              mr={isMobile ? 0 : 2}
            />
            {!isMobile && 'Direct Shares'}
          </Tab>
          <Tab
            minW={isMobile ? '60px' : '120px'}
            px={isMobile ? 3 : 4}
            fontSize={isMobile ? 'xs' : 'md'}
          >
            <Icon
              as={FaUserPlus}
              boxSize={isMobile ? 4 : 5}
              mr={isMobile ? 0 : 2}
            />
            {!isMobile && 'Friends'}
          </Tab>
        </TabList>
        <TabPanels>
          {/* Public Feed Panel removed */}
          <TabPanel px={{ base: 0, md: 2 }}>
            <SocialFeed
              posts={friendsPosts}
              loading={friendsLoading}
              error={friendsError}
              emptyMessage="No posts from friends yet. Encourage your friends to share!"
              illustration="👥"
            />
          </TabPanel>
          <TabPanel px={{ base: 0, md: 2 }}>
            <SocialFeed
              posts={directShares}
              loading={directLoading}
              error={directError}
              emptyMessage="No direct shares yet. When someone shares a book with you, it will appear here."
              illustration="📥"
            />
          </TabPanel>
          <TabPanel px={{ base: 0, md: 2 }}>
            <FriendsPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
