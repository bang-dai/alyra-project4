import {
    Box,
    Button,
    Drawer,
    DrawerOverlay,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    DrawerContent,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react'

const SidebarContent = ({ onClick }) => (
    <VStack>
        <Button w="100%" onClick={onClick}>
            Home
        </Button>
        <Button w="100%" onClick={onClick}>
            About
        </Button>
        <Button w="100%" onClick={onClick}>
            Contact
        </Button>
    </VStack>
)

const Sidebar = ({ variant, isOpen, onClose }) => {
    return variant === 'sidebar' ? (
        <Box
            position="fixed"
            left={0}
            p={5}
            w="200px"
            top={0}
            h="100%"
            bg={useColorModeValue('blue.900', 'gray.900')}
            borderRight="1px"
            borderRightColor={'gray.700'}
        >
            <SidebarContent />
        </Box>
    ) : (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay>
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Chakra-UI</DrawerHeader>
                    <DrawerBody>
                        <SidebarContent onClick={onClose} />
                    </DrawerBody>
                </DrawerContent>
            </DrawerOverlay>
        </Drawer>
    )
}

export default Sidebar