export interface GameProps {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  icon: React.ReactNode;
  slug: string;
}

export type GameDefinition = GameProps & {
  component: React.ComponentType<any>;
};
