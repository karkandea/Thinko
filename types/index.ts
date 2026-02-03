export interface GameProps {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  icon: string;
  slug: string;
}

export type GameDefinition = GameProps & {
  component: React.ComponentType<any>;
};
