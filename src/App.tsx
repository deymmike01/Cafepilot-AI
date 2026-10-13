/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from './services/storage';
import {
  Ingredient,
  Recipe,
  StockMovement,
  BusinessProfile,
  CalculatedRecipe,
  StockTransferSlip,
  UserRole,
} from './types';
import { calculateRecipeCost } from './utils/costing';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { IngredientsModule } from './components/IngredientsModule';
import { RecipesModule } from './components/RecipesModule';
import { MenuProfitability } from './components/MenuProfitability';
import { InventoryModule } from './components/InventoryModule';
import { AIAdvisorView } from './components/AIAdvisorView';
import { BusinessSettings } from './components/BusinessSettings';
import { LandingPage } from './components/LandingPage';
import { AcceptanceTestsModal } from './components/AcceptanceTestsModal';
import { AdminAccessGate } from './components/AdminAccessGate';
import { Plus, X, Building2 } from 'lucide-react';

export default function App() {
  // User Access Role (Admin / Manager vs Employee)
  const [userRole, setUserRole] = useState<UserRole>(StorageService.getUserRole());

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLandingPageMode, setIsLandingPageMode] = useState(false);
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [isCreateBizModalOpen, setIsCreateBizModalOpen] = useState(false);

  // Core Data State
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<BusinessProfile>(
    StorageService.getActiveBusiness()
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransferSlip[]>([]);

  // New Business Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizOwner, setNewBizOwner] = useState('');
  const [newBizEmail, setNewBizEmail] = useState('');
  const [newBizType, setNewBizType] = useState<BusinessProfile['businessType']>('Specialty Coffee');

  // Load from Storage
  const refreshData = () => {
    const bizList = StorageService.getBusinesses();
    const currentBiz = StorageService.getActiveBusiness();
    const activeIngs = StorageService.getActiveIngredients();
    const activeRecs = StorageService.getActiveRecipes();
    const activeMovs = StorageService.getActiveMovements();
    const activeTransfers = StorageService.getActiveStockTransfers();
    const role = StorageService.getUserRole();

    setBusinesses(bizList);
    setActiveBusiness(currentBiz);
    setIngredients(activeIngs);
    setRecipes(activeRecs);
    setMovements(activeMovs);
    setStockTransfers(activeTransfers);
    setUserRole(role);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Ingredient Map for Fast Costing Lookup
  const ingredientsMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach((ing) => map.set(ing.id, ing));
    return map;
  }, [ingredients]);

  // Dynamically Calculated Recipes (Cascades ingredient price changes & overhead allocations!)
  const calculatedRecipes = useMemo<CalculatedRecipe[]>(() => {
    return recipes.map((r) =>
      calculateRecipeCost(r, ingredientsMap, activeBusiness.overheadSettings)
    );
  }, [recipes, ingredientsMap, activeBusiness.overheadSettings]);

  // Business Switcher
  const handleSwitchBusiness = (bizId: string) => {
    StorageService.setActiveBusinessId(bizId);
    refreshData();
  };

  // Create Business
  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const created = StorageService.createBusiness({
      name: newBizName.trim(),
      ownerName: newBizOwner.trim() || 'Café Owner',
      email: newBizEmail.trim() || 'owner@example.com',
      businessType: newBizType,
      currency: 'PHP',
      plan: 'pro',
      targetFoodCostPercent: 28,
    });

    setNewBizName('');
    setNewBizOwner('');
    setNewBizEmail('');
    setIsCreateBizModalOpen(false);
    refreshData();
  };

  // Ingredient Handlers
  const handleSaveIngredient = (ing: Ingredient) => {
    StorageService.saveIngredient(ing);
    refreshData();
  };

  const handleDeleteIngredient = (ingId: string) => {
    StorageService.deleteIngredient(ingId);
    refreshData();
  };

  // Recipe Handlers
  const handleSaveRecipe = (recipe: Recipe) => {
    StorageService.saveRecipe(recipe);
    refreshData();
  };

  const handleDeleteRecipe = (recipeId: string) => {
    StorageService.deleteRecipe(recipeId);
    refreshData();
  };

  // Role Switcher Handler
  const handleSwitchRole = (role: UserRole) => {
    StorageService.setUserRole(role);
    setUserRole(role);
    if (
      role === 'employee' &&
      (activeTab === 'settings' ||
        activeTab === 'profitability' ||
        activeTab === 'advisor' ||
        activeTab === 'recipes')
    ) {
      setActiveTab('inventory');
    }
  };

  // Stock Transfer Handler (Central Stock Room -> Bar / Kitchen)
  const handleSaveTransfer = (
    transferData: Omit<StockTransferSlip, 'id' | 'createdAt'>
  ): StockTransferSlip => {
    const slip = StorageService.recordStockTransferAndDeduct(transferData);
    refreshData();
    return slip;
  };

  // Quick Stock Adjustment Handler
  const handleUpdateIngredientStock = (
    ingredientId: string,
    newStock: number,
    reason: string
  ) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (ing) {
      StorageService.recordMovement({
        businessId: activeBusiness.id,
        ingredientId,
        type: 'MANUAL_ADJUSTMENT',
        quantity: newStock,
        unit: ing.baseUnit,
        costAtMovement: ing.effectiveCostPerBaseUnit,
        reason,
      });
      refreshData();
    }
  };

  // Movement Handlers
  const handleLogMovement = (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    StorageService.recordMovement(movement);
    refreshData();
  };

  // Update Business Profile
  const handleUpdateBusiness = (updated: Partial<BusinessProfile>) => {
    StorageService.updateActiveBusiness(updated);
    refreshData();
  };

  const isEmployee = userRole === 'employee';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        businesses={businesses}
        activeBusiness={activeBusiness}
        userRole={userRole}
        onSwitchRole={handleSwitchRole}
        onSwitchBusiness={handleSwitchBusiness}
        onCreateBusiness={() => setIsCreateBizModalOpen(true)}
        onOpenTests={() => setIsTestsModalOpen(true)}
        isLandingPageMode={isLandingPageMode}
        setIsLandingPageMode={setIsLandingPageMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLandingPageMode ? (
          <LandingPage
            onLaunchApp={() => setIsLandingPageMode(false)}
            onOpenTests={() => setIsTestsModalOpen(true)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'dashboard' && (
              <Dashboard
                recipes={calculatedRecipes}
                ingredients={ingredients}
                business={activeBusiness}
                setActiveTab={setActiveTab}
                onOpenNewRecipe={() => setActiveTab('recipes')}
                onOpenNewIngredient={() => setActiveTab('ingredients')}
              />
            )}

            {activeTab === 'ingredients' && (
              <IngredientsModule
                ingredients={ingredients}
                onSaveIngredient={handleSaveIngredient}
                onDeleteIngredient={handleDeleteIngredient}
                activeBusinessId={activeBusiness.id}
                userRole={userRole}
              />
            )}

            {activeTab === 'recipes' &&
              (isEmployee ? (
                <AdminAccessGate
                  moduleTitle="Recipe Costing & Pricing Formulas"
                  moduleDescription="Recipe ingredient formulas, food cost percentages, and margin targets are reserved for Café Managers."
                  onUnlockAdmin={() => handleSwitchRole('admin')}
                  onGoToInventory={() => setActiveTab('inventory')}
                />
              ) : (
                <RecipesModule
                  recipes={calculatedRecipes}
                  ingredients={ingredients}
                  business={activeBusiness}
                  onSaveRecipe={handleSaveRecipe}
                  onDeleteRecipe={handleDeleteRecipe}
                  activeBusinessId={activeBusiness.id}
                />
              ))}

            {activeTab === 'profitability' &&
              (isEmployee ? (
                <AdminAccessGate
                  moduleTitle="Menu Profitability & Target Margins"
                  moduleDescription="Confidential menu net margin percentages, gross profits, and pricing simulations are restricted to Managers."
                  onUnlockAdmin={() => handleSwitchRole('admin')}
                  onGoToInventory={() => setActiveTab('inventory')}
                />
              ) : (
                <MenuProfitability
                  recipes={calculatedRecipes}
                  business={activeBusiness}
                  onSelectRecipe={() => setActiveTab('recipes')}
                />
              ))}

            {activeTab === 'inventory' && (
              <InventoryModule
                ingredients={ingredients}
                movements={movements}
                stockTransfers={stockTransfers}
                business={activeBusiness}
                userRole={userRole}
                onLogMovement={handleLogMovement}
                onSaveTransfer={handleSaveTransfer}
                onUpdateIngredientStock={handleUpdateIngredientStock}
                onSwitchRole={handleSwitchRole}
              />
            )}

            {activeTab === 'advisor' &&
              (isEmployee ? (
                <AdminAccessGate
                  moduleTitle="AI Business Financial Advisor"
                  moduleDescription="Strategic overhead reductions, supplier cost renegotiations, and pricing simulations are restricted to Managers."
                  onUnlockAdmin={() => handleSwitchRole('admin')}
                  onGoToInventory={() => setActiveTab('inventory')}
                />
              ) : (
                <AIAdvisorView
                  recipes={calculatedRecipes}
                  ingredients={ingredients}
                  business={activeBusiness}
                />
              ))}

            {activeTab === 'settings' &&
              (isEmployee ? (
                <AdminAccessGate
                  moduleTitle="Operating Overheads (Bills, Rent & Employee Payroll Rates)"
                  moduleDescription="Confidential overhead bills (electricity, water), store rent, barista payroll rates, and multi-branch isolation settings are restricted to Café Managers and Admins only."
                  onUnlockAdmin={() => handleSwitchRole('admin')}
                  onGoToInventory={() => setActiveTab('inventory')}
                />
              ) : (
                <BusinessSettings
                  activeBusiness={activeBusiness}
                  businesses={businesses}
                  onUpdateBusiness={handleUpdateBusiness}
                  onSwitchBusiness={handleSwitchBusiness}
                  onCreateBusiness={() => setIsCreateBizModalOpen(true)}
                  onRefreshData={refreshData}
                />
              ))}
          </div>
        )}
      </main>

      {/* Acceptance Tests Modal */}
      <AcceptanceTestsModal
        isOpen={isTestsModalOpen}
        onClose={() => setIsTestsModalOpen(false)}
      />

      {/* Create New Business Modal */}
      {isCreateBizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Register New Café Account</h3>
              </div>
              <button
                onClick={() => setIsCreateBizModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Creates an independent, isolated workspace partition with isolated ingredients and recipes.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business / Café Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Grind Coffee Cubao"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Type</label>
                <select
                  value={newBizType}
                  onChange={(e) => setNewBizType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                >
                  <option value="Specialty Coffee">Specialty Coffee Shop</option>
                  <option value="Milk Tea & Boba">Milk Tea & Boba Shop</option>
                  <option value="Coffee Stall / Kiosk">Coffee Stall / Kiosk</option>
                  <option value="Juice & Smoothie Bar">Juice & Smoothie Bar</option>
                  <option value="Multi-branch Café">Multi-branch Café</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={newBizOwner}
                  onChange={(e) => setNewBizOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="maria@dailygrind.ph"
                  value={newBizEmail}
                  onChange={(e) => setNewBizEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBizModalOpen(false)}
                  className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold shadow-2xs"
                >
                  Create & Open Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
