import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Spinner,
  Box,
  Heading,
} from '@chakra-ui/react';
import { getAllUsers } from '../firebase/userProfile';

export default function AdminUserDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName &&
        u.displayName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Box p={6}>
      <Heading mb={4}>Admin User Management</Heading>
      <Input
        placeholder="Search by email or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        maxW="400px"
      />
      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Display Name</Th>
              <Th>Roles</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((user) => (
              <Tr key={user.id}>
                <Td>{user.email}</Td>
                <Td>{user.displayName || '-'}</Td>
                <Td>
                  {user.admin ? 'Admin' : 'User'}
                  {user.premium ? ', Premium' : ''}
                </Td>
                <Td>{user.deactivated ? 'Deactivated' : 'Active'}</Td>
                <Td>
                  <Button size="sm" colorScheme="blue" mr={2}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={user.deactivated ? 'green' : 'red'}
                  >
                    {user.deactivated ? 'Reactivate' : 'Deactivate'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
