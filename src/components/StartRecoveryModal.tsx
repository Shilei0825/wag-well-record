import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Calendar } from "lucide-react";

interface StartRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  petName: string;
  symptom: string;
  isLoading?: boolean;
}

export function StartRecoveryModal({
  open,
  onOpenChange,
  onConfirm,
  petName,
  symptom,
  isLoading = false,
}: StartRecoveryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">是否开启恢复观察？</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              为 <span className="font-medium text-foreground">{petName}</span> 开启 3 天恢复观察计划
            </p>
            <p className="text-sm">
              观察症状：<span className="text-foreground">{symptom}</span>
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">每天记录 2-3 个简单问题</p>
              <p className="text-muted-foreground">只需点选，无需打字</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">观察结束后获得 AI 总结</p>
              <p className="text-muted-foreground">了解恢复趋势，获取建议</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            暂不需要
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "创建中..." : "开启观察"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
