import { Flex, Text, Icon } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';

export default function GreetingBar({ user, displayName }) {
  if (!user) return null;
  return (
    <Flex align="center" mb={8} gap={3}>
      <Text
        fontSize="lg"
        color="gray.700"
        fontWeight="bold"
        noOfLines={1}
        maxW="60vw"
        isTruncated
      >
        {displayName && displayName.trim()
          ? `Hey ${displayName.trim()}!`
          : user.displayName && user.displayName.trim()
          ? `Hey ${user.displayName.trim()}!`
          : user.email
          ? `Hey there! (${user.email})`
          : 'Hey there!'}
      </Text>
      <Icon
        as={FiLogOut}
        boxSize={6}
        color="gray.500"
        cursor="pointer"
        title="Sign Out"
        onClick={() => window.dispatchEvent(new Event('signOut'))}
        _hover={{ color: 'red.500' }}
      />
    </Flex>
  );
}
