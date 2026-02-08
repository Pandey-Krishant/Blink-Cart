import React from 'react'
import Herosection from './Herosection'
import CategorySLider from './CategorySLider'
import connectDB from '@/lib/db'
import Grocery from '@/modals/grocery.model'
import Grocerycard from './Grocerycard'
import ScrollToMatch from './ScrollToMatch'

async function UserDashboard({ search = "" }: { search?: string }) {
  await connectDB();
  
  // 1. Data fetch karo
  const rawGrocery = await Grocery.find({}).lean();

  // 2. Data ko "Plain Object" mein convert karo (id ko string banake)
  const grocery = rawGrocery.map((doc: any) => ({
    ...doc,
    _id: doc._id.toString(), // Ye line error fix kar degi
    createdAt: doc.createdAt?.toString(), // Agar date hai toh usko bhi string karo
    updatedAt: doc.updatedAt?.toString(),
  }));

  const query = (search || "").trim().toLowerCase();
  const matchesQuery = (item: any) =>
    String(item.name || "").toLowerCase().includes(query) ||
    String(item.category || "").toLowerCase().includes(query);

  const filtered = query ? grocery.filter((item: any) => matchesQuery(item)) : grocery;
  const firstMatchId = query && filtered.length > 0 ? String(filtered[0]._id) : "";

  return (
    <>
      <Herosection />
      <ScrollToMatch query={query} />
      <CategorySLider />

      <div className="relative z-20 max-w-[1400px] mx-auto px-10 py-20">
        <h2 className="text-3xl font-bold text-white mb-8 italic text-center w-full">
  FRESH <span className="text-blue-500">STUFF</span>
</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.length > 0 ? (
            filtered.map((item: any) => (
              // Ab yahan item._id ek simple string hai, toh koi tension nahi
              <Grocerycard
                key={item._id}
                item={item}
                highlight={query ? matchesQuery(item) : false}
                dataSearchMatch={firstMatchId === String(item._id)}
              />
            ))
          ) : (
            <p className="text-white/50 col-span-full text-center py-10">
              No products found in database.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
