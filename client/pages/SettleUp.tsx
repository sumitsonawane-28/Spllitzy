import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { CheckCircle, Send } from 'lucide-react';

export default function SettleUp() {
  const { groupId } = useParams<{ groupId: string }>();
  const { getGroup, getBalances, addActivity } = useExpenseStore();
  const navigate = useNavigate();
  const [settledTransactions, setSettledTransactions] = useState<Set<string>>(
    new Set()
  );

  const group = getGroup(groupId || '');

  if (!groupId || !group) {
    navigate('/dashboard');
    return null;
  }

  const balances = getBalances(groupId);

  // Calculate settlement suggestions
  const calculateSettlements = () => {
    const settlements: Array<{
      id: string;
      from: string;
      to: string;
      amount: number;
    }> = [];
    const tempBalances = { ...balances };

    const getDebtors = () =>
      Object.entries(tempBalances)
        .filter(([, balance]) => balance < 0)
        .sort((a, b) => a[1] - b[1]);

    const getCreditors = () =>
      Object.entries(tempBalances)
        .filter(([, balance]) => balance > 0)
        .sort((a, b) => b[1] - a[1]);

    let debtors = getDebtors();
    let creditors = getCreditors();

    while (debtors.length > 0 && creditors.length > 0) {
      const [debtor, debtAmount] = debtors[0];
      const [creditor, creditAmount] = creditors[0];

      const settleAmount = Math.min(
        Math.abs(debtAmount),
        creditAmount
      );

      settlements.push({
        id: `${debtor}-${creditor}`,
        from: debtor,
        to: creditor,
        amount: settleAmount,
      });

      tempBalances[debtor] += settleAmount;
      tempBalances[creditor] -= settleAmount;

      if (Math.abs(tempBalances[debtor]) < 0.01) {
        debtors = getDebtors();
      }
      if (Math.abs(tempBalances[creditor]) < 0.01) {
        creditors = getCreditors();
      }
    }

    return settlements;
  };

  const settlements = calculateSettlements();

  const handleSettle = (from: string, to: string) => {
    const txnId = `${from}-${to}`;
    const newSettled = new Set(settledTransactions);
    newSettled.add(txnId);
    setSettledTransactions(newSettled);

    const fromName = group.members.find((m) => m.id === from)?.name;
    const toName = group.members.find((m) => m.id === to)?.name;

    addActivity({
      groupId,
      type: 'settlement',
      description: `${fromName} settled payment to ${toName}`,
    });
  };

  const allSettled = settlements.every((s) =>
    settledTransactions.has(s.id)
  );

  return (
    <Layout title="Settle Up" showBack>
      <div className="max-w-2xl mx-auto space-y-6">
        {settlements.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              All Settled Up! 🎉
            </h3>
            <p className="text-green-700 mb-6">
              Everyone's accounts are balanced. No payments needed.
            </p>
            <Button
              onClick={() => navigate(`/group/${groupId}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Group
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm">
                <strong>{settlements.length}</strong> settlement
                {settlements.length !== 1 ? 's' : ''} needed to balance this
                group.
              </p>
            </div>

            <div className="space-y-3">
              {settlements.map((settlement) => {
                const fromName = group.members.find(
                  (m) => m.id === settlement.from
                )?.name;
                const toName = group.members.find(
                  (m) => m.id === settlement.to
                )?.name;
                const isSettled = settledTransactions.has(settlement.id);

                return (
                  <div
                    key={settlement.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSettled
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {fromName}
                          <span className="text-gray-500 mx-2">→</span>
                          {toName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Send payment via UPI or agreed method
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-lg font-bold text-gray-900">
                          {group.currency} {settlement.amount.toFixed(2)}
                        </p>
                        {!isSettled ? (
                          <Button
                            onClick={() =>
                              handleSettle(settlement.from, settlement.to)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                          >
                            <Send size={16} />
                            Mark Settled
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-700 font-medium">
                            <CheckCircle size={18} />
                            Settled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {allSettled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle size={40} className="mx-auto text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  All Settled!
                </h3>
                <p className="text-green-700 mb-4">
                  Great job! All payments have been marked as complete.
                </p>
                <Button
                  onClick={() => navigate(`/group/${groupId}`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Back to Group
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
