using UnityEngine;
using System;

namespace RTS.Core
{
    public enum ResourceType { Rice, Supplies, Fuel, Gold }

    public class ResourceManager : MonoBehaviour
    {
        public static ResourceManager Instance;

        public int Rice = 500;
        public int Supplies = 200;
        public int Fuel = 0;
        public int Gold = 0;

        public event Action OnResourceChanged;

        private void Awake()
        {
            Instance = this;
        }

        public bool CanAfford(int riceCost, int suppliesCost, int fuelCost)
        {
            return Rice >= riceCost && Supplies >= suppliesCost && Fuel >= fuelCost;
        }

        public void SpendResources(int riceCost, int suppliesCost, int fuelCost)
        {
            if (CanAfford(riceCost, suppliesCost, fuelCost))
            {
                Rice -= riceCost;
                Supplies -= suppliesCost;
                Fuel -= fuelCost;
                OnResourceChanged?.Invoke();
            }
        }

        public void AddResource(ResourceType type, int amount)
        {
            switch (type)
            {
                case ResourceType.Rice: Rice += amount; break;
                case ResourceType.Supplies: Supplies += amount; break;
                case ResourceType.Fuel: Fuel += amount; break;
                case ResourceType.Gold: Gold += amount; break;
            }
            OnResourceChanged?.Invoke();
        }

        public void AddResources(int rice, int supplies, int fuel)
        {
            Rice += rice;
            Supplies += supplies;
            Fuel += fuel;
            OnResourceChanged?.Invoke();
        }
    }
}
