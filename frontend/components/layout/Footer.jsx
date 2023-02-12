import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

const Footer = () => {
    return (
        <Flex minH="10vh" p="2rem" justifyContent="center" alignItems="center">
            <Text>&copy; H2O by Bang.D @ {new Date().getFullYear()}</Text>
        </Flex>
    );
};

export default Footer;