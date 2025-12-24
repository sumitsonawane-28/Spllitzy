import { useState, useEffect, useMemo } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { CalendarIcon, Search, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export default function History() {
  const { groups } = useExpenseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [datePreset, setDatePreset] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get all unique categories and groups
  const categories = useMemo(() => {
    const cats = new Set<string>();
    groups.forEach(group => {
      group.expenses.forEach(expense => {
        if (expense.category) {
          cats.add(expense.category);
        }
      });
    });
    return Array.from(cats).sort();
  }, [groups]);

  // Get all expenses from all groups
  const allExpenses = useMemo(() => {
    return groups.flatMap(group => 
      group.expenses.map(expense => ({
        ...expense,
        groupName: group.name,
        paidByName: group.members.find(m => m.id === expense.paidBy)?.name || 'Unknown'
      }))
    );
  }, [groups]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let result = [...allExpenses];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(expense => 
        expense.title.toLowerCase().includes(query) || 
        expense.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(expense => expense.category === selectedCategory);
    }

    // Apply group filter
    if (selectedGroup !== 'all') {
      result = result.filter(expense => 
        groups.some(g => g.id === selectedGroup && g.expenses.some(e => e.id === expense.id))
      );
    }

    // Apply date filters
    if (datePreset !== 'custom' && datePreset !== 'all') {
      const today = new Date();
      let from: Date;
      let to: Date = today;

      switch (datePreset) {
        case 'today':
          from = new Date(today.setHours(0, 0, 0, 0));
          break;
        case 'thisWeek':
          from = startOfWeek(today);
          to = endOfWeek(today);
          break;
        case 'thisMonth':
          from = startOfMonth(today);
          to = endOfMonth(today);
          break;
        case 'last30days':
          from = subDays(today, 30);
          break;
        default:
          from = new Date(0);
      }

      result = result.filter(expense => {
        const expenseDate = new Date(expense.date);
        return isWithinInterval(expenseDate, { start: from, end: to });
      });
    } else if (dateRange.from || dateRange.to) {
      result = result.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (!dateRange.from || expenseDate >= dateRange.from) && 
               (!dateRange.to || expenseDate <= dateRange.to);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allExpenses, searchQuery, selectedCategory, selectedGroup, datePreset, dateRange, sortField, sortOrder, groups]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGroup('all');
    setDatePreset('all');
    setDateRange({ from: undefined, to: undefined });
    setSortField('date');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Expense History</h1>
        <div className="flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <Select 
                  value={datePreset}
                  onValueChange={(value) => {
                    setDatePreset(value);
                    if (value === 'custom') {
                      setDateRange({ from: undefined, to: undefined });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {datePreset === 'custom' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP") : <span>From</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP") : <span>To</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Group</label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search expenses..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th 
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Description
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Group
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Category
                </th>
                <th 
                  className="h-12 px-4 text-right align-middle font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      {format(new Date(expense.date), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      <div>{expense.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Paid by {expense.paidByName}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {expense.groupName}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-right align-middle font-medium">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right align-middle">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
