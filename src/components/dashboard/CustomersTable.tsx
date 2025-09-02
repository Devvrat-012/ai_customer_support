"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye,
  MessageSquare,
  User,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { 
  fetchCustomers, 
  setFilters, 
  clearFilters,
  type Customer,
  type CustomersFilters 
} from '@/lib/store/customersSlice';
import { addAlert } from '@/lib/store/alertSlice';

interface CustomersTableProps {
  onCustomerClick?: (customer: Customer) => void;
  onViewConversations?: (customer: Customer) => void;
}

export function CustomersTable({ onCustomerClick, onViewConversations }: CustomersTableProps) {
  const dispatch = useAppDispatch();
  const { 
    customers, 
    loading, 
    error, 
    filters, 
    pagination 
  } = useAppSelector((state) => state.customers);

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers({ 
      page: pagination.customers.page, 
      limit: pagination.customers.limit,
      filters 
    }));
  }, [dispatch, filters, pagination.customers.page, pagination.customers.limit]);

  useEffect(() => {
    if (error.customers) {
      dispatch(addAlert({
        type: 'error',
        title: 'Error',
        message: error.customers
      }));
    }
  }, [error.customers, dispatch]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchInput }));
  };

  const handleFilterChange = (newFilters: Partial<CustomersFilters>) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(clearFilters());
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchCustomers({ 
      page, 
      limit: pagination.customers.limit,
      filters 
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, label: 'Active' },
      RESOLVED: { variant: 'secondary' as const, label: 'Resolved' },
      CLOSED: { variant: 'outline' as const, label: 'Closed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading.customers && customers.length === 0) {
    return (
      <Card className="p-8 bg-card border">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Search customers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-6 bg-muted/30 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
              <select
                value={filters.status || 'ALL'}
                onChange={(e) => handleFilterChange({ status: e.target.value as 'ACTIVE' | 'RESOLVED' | 'CLOSED' | 'ALL' })}
                className="w-full p-2 border rounded-md bg-background text-foreground"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Sort By</label>
              <select
                value={filters.sortBy || 'lastSeenAt'}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'lastSeenAt' | 'createdAt' | 'sessionCount' | 'customerName' })}
                className="w-full p-2 border rounded-md bg-background text-foreground"
              >
                <option value="lastSeenAt">Last Seen</option>
                <option value="createdAt">Created Date</option>
                <option value="sessionCount">Session Count</option>
                <option value="customerName">Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Sort Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-full p-2 border rounded-md bg-background text-foreground"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border">
              <th className="text-left p-3 font-medium text-foreground">Customer</th>
              <th className="text-left p-3 font-medium text-foreground">Contact</th>
              <th className="text-left p-3 font-medium text-foreground">Sessions</th>
              <th className="text-left p-3 font-medium text-foreground">Last Seen</th>
              <th className="text-left p-3 font-medium text-foreground">Latest Status</th>
              <th className="text-left p-3 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr 
                key={customer.id} 
                className="border-b border hover:bg-muted/50 cursor-pointer"
                onClick={() => onCustomerClick?.(customer)}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {customer.customerName || customer.customerId}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {customer.customerId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    {customer.customerEmail && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {customer.customerEmail}
                      </div>
                    )}
                    {customer.customerPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.customerPhone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{customer.sessionCount}</span>
                    <span className="text-sm text-muted-foreground">
                      ({customer.conversationCount || 0} conversations)
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  {customer.lastSeenAt ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatDate(customer.lastSeenAt)}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Never</span>
                  )}
                </td>
                <td className="p-3">
                  {customer.latestConversation ? (
                    getStatusBadge(customer.latestConversation.status)
                  ) : (
                    <Badge variant="outline">No conversations</Badge>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewConversations?.(customer);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && !loading.customers && (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No customers found
          </h3>
          <p className="text-muted-foreground">
            Customers will appear here when they start using your widget.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.customers.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.customers.page - 1) * pagination.customers.limit) + 1} to{' '}
            {Math.min(pagination.customers.page * pagination.customers.limit, pagination.customers.total)} of{' '}
            {pagination.customers.total} customers
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.customers.page - 1)}
              disabled={pagination.customers.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.customers.page + 1)}
              disabled={pagination.customers.page === pagination.customers.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
