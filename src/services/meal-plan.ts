
'use server';

import { collection, doc, getDocs, limit, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailyPlan, MealPlan, MealPlanData } from '@/lib/types';
import { addDays, format } from 'date-fns';

const DAILY_MEALS_COLLECTION = 'daily-meals';

export async function getLatestMealPlan(): Promise<MealPlanData | null> {
  try {
    const q = query(collection(db, DAILY_MEALS_COLLECTION), orderBy("date", "desc"), limit(14));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const dailyPlans: DailyPlan[] = querySnapshot.docs.map(doc => doc.data() as DailyPlan).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dailyPlans.length === 0) {
        return null;
    }

    return {
        plan: dailyPlans,
        startDate: dailyPlans[0].date
    };
    
  } catch (error) {
    console.error("Error fetching latest meal plan from Firestore.", error);
    return null;
  }
}

export async function saveMealPlan(mealPlanData: MealPlanData): Promise<void> {
    try {
        const batch = writeBatch(db);
        const startDate = new Date(mealPlanData.startDate);

        mealPlanData.plan.forEach((dailyPlan, index) => {
            const planDate = addDays(startDate, index);
            const planId = format(planDate, 'yyyy-MM-dd');
            const docRef = doc(db, DAILY_MEALS_COLLECTION, planId);
            
            const dataToSave: DailyPlan = {
                date: planId,
                ...dailyPlan
            }
            batch.set(docRef, dataToSave);
        });
        
        await batch.commit();

    } catch(error) {
        console.error("Error saving meal plan to Firestore.", error);
        throw new Error("Could not save meal plan.");
    }
}
