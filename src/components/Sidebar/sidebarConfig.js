// sidebarConfig.js
export const sidebarConfig = {
    admin: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            url: '/admin/dashboard',
            icon: 'bi-speedometer2',
            type: 'single'
        },
        {
            id: 'userManagement',
            label: 'User Management',
            icon: 'bi-people-fill',
            type: 'dropdown',
            children: [
                {
                    id: 'allUsers',
                    label: 'All Users',
                    url: '/admin/users',
                },
                {
                    id: 'deleteUser',
                    label: 'Delete User',
                    url: '/admin/deleteUser',
                }
            ]
        },
        {
            id: 'nearbyBusiness',
            label: 'NearBy Business',
            icon: 'bi-grid-1x2-fill',
            type: 'dropdown',
            children: [
                {
                    id: 'nearbyCategories',
                    label: 'All Categories',
                    url: '/admin/nearby-categories',
                },
                {
                    id: 'allBusinesses',
                    label: 'Nearby Businesses',
                    url: '/admin/all-businesses',
                },
                {
                    id: 'healthWellness',
                    label: 'Health and Wellness',
                    url: '/admin/health-wellness',
                }
            ]
        },
        {
            id: 'marketplace',
            label: 'MarketPlace',
            icon: 'bi-grid-1x2-fill',
            type: 'dropdown',
            children: [
                {
                    id: 'categories',
                    label: 'All Categories',
                    url: '/admin/categories',
                },
                {
                    id: 'subcategories',
                    label: 'Sub Categories',
                    url: '/admin/subcategories',
                },
                {
                    id: 'vendors',
                    label: 'All Vendors',
                    url: '/admin/vendors',
                },
                {
                    id: 'allProducts',
                    label: 'All Products',
                    url: '/admin/all-products',
                },
                {
                    id: 'productOrders',
                    label: 'Product Orders',
                    url: '/admin/product-orders',
                }
            ]
        },
        {
            id: 'reportedPosts',
            label: 'Reported Posts',
            icon: 'bi-exclamation-circle',
            type: 'dropdown',
            children: [
                {
                    id: 'allReportedPosts',
                    label: 'All Reported Posts',
                    url: '/admin/reported-posts',
                }
            ]
        },
        {
            id: 'eventManagement',
            label: 'Event Management',
            icon: 'bi-calendar-event',
            type: 'dropdown',
            children: [
                {
                    id: 'allEventOrganizers',
                    label: 'All Event Organizers',
                    url: '/admin/all-event-organizers',
                },
                {
                    id: 'allEvents',
                    label: 'All Events',
                    url: '/admin/events',
                }
            ]
        },
        {
            id: 'infoPages',
            label: 'Info Pages',
            icon: 'bi-file-earmark-text',
            type: 'dropdown',
            children: [
                {
                    id: 'allPages',
                    label: 'All Pages',
                    url: '/admin/pages',
                },
                {
                    id: 'faqs',
                    label: 'FAQ',
                    url: '/admin/faqs',
                },
                // {
                //     id: 'contact',
                //     label: 'Contact Us',
                //     url: '/admin/contact',
                // }
            ]
        }
    ],

    event_manager: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            url: '/user/dashboard',
            icon: 'bi-speedometer2',
            type: 'single'
        },
        {
            id: 'eventManagement',
            label: "Event Management",
            icon: 'bi-calendar-event',
            type: 'dropdown',
            children: [
                {
                    id: 'myEvents',
                    label: 'My Events',
                    url: '/user/events',
                },
                {
                    id: 'upcomingEvents',
                    label: 'Upcoming Events',
                    url: '/user/upcoming-events',
                },
                {
                    id: 'pastEvents',
            label: 'Past Events',
            url: '/user/past-events',
                },{
 id: 'bookedTickets',
            label: 'Booked Tickets',
            url: '/user/booked-tickets',
                },{
                    id: 'cancelledTickets',
                    label: 'Cancelled Tickets',
                    url: '/user/cancelled-tickets',
                }
            ]
        },
    ],

    vendor: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            url: '/user/dashboard',
            icon: 'bi-speedometer2',
            type: 'single'
        },
        {
            id: 'vendorMarketplace',
            label: 'MarketPlace',
            icon: 'bi-grid-1x2-fill',
            type: 'dropdown',
            children: [
                // {
                //     id: 'allProducts',
                //     label: 'All Products',
                //     url: '/user/products',
                // },
                {
                    id: 'orders',
                    label: 'Orders',
                    url: '/user/orders',
                },
                {
                    id: 'placeOrders',
                    label: 'Place Orders',
                    url: '/user/place-orders',
                },
                {
                    id: 'completedOrders',
                    label: 'Completed Orders',
                    url: '/user/completed-orders',
                },
                {
                    id: 'cancelledOrders',
                    label: 'Cancelled Orders',
                    url: '/user/cancelled-orders',
                }
            ]
        },
        // {

        //     icon: 'bi-calendar-date',
        //     type: ''
        // },
        // {

        //     icon: 'bi-calendar4-event',
        //     type: 'single'
        // },
        // {
        //    
        //     icon: 'bi-calendar-check',
        //     type: 'single'
        // },
        // {
        //     id: 'cancelledOrders',
        //     label: 'Cancelled Orders',
        //     url: '/user/cancelled-orders',
        //     icon: 'bi-calendar-x',
        //     type: 'single'
        // }
    ]
};

export const getChildUrls = (menuItem) => {
    if (menuItem.type === 'dropdown' && menuItem.children) {
        return menuItem.children.map(child => child.url);
    }
    return [];
};

export const getMenuItemsForRoles = (userRoles) => {
    const menuItems = [];

    userRoles.forEach(role => {
        if (sidebarConfig[role]) {
            menuItems.push(...sidebarConfig[role]);
        }
    });

    return menuItems.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
    );
};